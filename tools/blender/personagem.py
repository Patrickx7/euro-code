"""
Monta o dev (personagem principal) sobre a malha humana base do MakeHuman (CC0) e exporta em glTF.

    python tools/blender/personagem.py public/models/personagem/dev.glb

A malha base e os morphs vêm do projeto MakeHuman (assets em CC0 1.0, https://www.makehumancommunity.org):
- base.obj: repositório makehumancommunity/makehuman (makehuman/data/3dobjs/base.obj)
- targets.npz: pacote `makehuman` do PyPI (makehuman/data/targets.npz)
Os dois são baixados para `tools/blender/makehuman/` na primeira execução (ver `ensure_assets`).

Cabelos, barbas, sobrancelhas, roupas e tênis são gerados a partir da própria pele: regiões do corpo
são duplicadas e afastadas da superfície, então sempre encaixam no corpo.

Convenções do glTF exportado (Three.js: Y para cima, personagem olhando para +Z), altura ~1,73 m:
- Sempre visíveis: Body, Eyes, Brows, Pants, Shoes.
- Variações (o jogo liga/desliga pelo nome): Hair_Curto, Hair_Cacheado, Hair_Coque, Hair_Rabo,
  Beard_Cheia, Beard_Bigode, Glasses_Redondo, Top_Moletom, Top_Camiseta, Top_Xadrez, Backpack.
- Materiais com nome fixo (cor trocada no jogo): Skin, Hair, Top, Pants, Shoes, ShoeSole, Backpack.
"""

import collections
import glob
import math
import os
import subprocess
import sys
import urllib.request
import zipfile

import bpy  # precisa vir antes: registra os módulos bmesh e mathutils

import bmesh  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402

OUT = sys.argv[-1] if sys.argv[-1].endswith(".glb") else "dev.glb"
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "makehuman")
BASE_OBJ_URL = "https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/3dobjs/base.obj"


# ---------------------------------------------------------------- assets do MakeHuman


def ensure_assets():
    """Baixa a malha base e os morphs (CC0) se ainda não estiverem em tools/blender/makehuman/."""
    os.makedirs(ASSETS, exist_ok=True)
    obj = os.path.join(ASSETS, "base.obj")
    npz = os.path.join(ASSETS, "targets.npz")
    if not os.path.exists(obj):
        print("Baixando base.obj do MakeHuman...")
        urllib.request.urlretrieve(BASE_OBJ_URL, obj)
    if not os.path.exists(npz):
        print("Baixando targets.npz (pacote makehuman do PyPI)...")
        subprocess.run(
            [sys.executable, "-m", "pip", "download", "--no-deps", "--quiet", "-d", ASSETS, "makehuman==1.3.2"],
            check=True,
        )
        wheel = glob.glob(os.path.join(ASSETS, "makehuman-*.whl"))[0]
        with zipfile.ZipFile(wheel) as z, open(npz, "wb") as f:
            f.write(z.read("makehuman/data/targets.npz"))
        os.remove(wheel)
    return obj, npz


def load_base(obj_path, npz_path):
    """Lê o OBJ (vértices, UVs, faces por grupo) e aplica os morphs de um homem jovem, médio."""
    verts, uvs = [], []
    groups = collections.defaultdict(list)  # grupo -> [(índices de vértice, índices de uv)]
    group = None
    with open(obj_path) as f:
        for line in f:
            if line.startswith("v "):
                verts.append([float(x) for x in line.split()[1:4]])
            elif line.startswith("vt "):
                uvs.append([float(x) for x in line.split()[1:3]])
            elif line.startswith("g "):
                group = line[2:].strip()
            elif line.startswith("f "):
                parts = [p.split("/") for p in line.split()[1:]]
                groups[group].append(([int(p[0]) - 1 for p in parts], [int(p[1]) - 1 for p in parts]))
    V = np.array(verts, dtype=np.float64)
    targets = np.load(npz_path)

    def add(name, weight):
        V[targets[f"targets/{name}.index"]] += weight * targets[f"targets/{name}.vector"] * 1e-3

    for race in ("african", "asian", "caucasian"):  # média das três: rosto neutro, nem caricato
        add(f"macrodetails/{race}-male-young", 1 / 3)
    add("macrodetails/universal-male-young-averagemuscle-averageweight", 1.0)

    # MakeHuman: Y para cima, olhando para +Z, em decímetros. Blender: Z para cima, olhando para -Y, metros.
    B = np.stack([V[:, 0], -V[:, 2], V[:, 1]], axis=1) * 0.1
    body_idx = sorted({i for f, _ in groups["body"] for i in f})
    B[:, 2] -= B[body_idx, 2].min()

    joints = {}
    for name, faces in groups.items():
        if name and name.startswith("joint-"):
            idx = sorted({i for f, _ in faces for i in f})
            joints[name[6:]] = Vector(B[idx].mean(axis=0))
    return B, np.array(uvs), groups, joints


# ---------------------------------------------------------------- materiais


def srgb(hex_color):
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i : i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


def material(name, hex_color, roughness=0.6, metallic=0.0, vertex_colors=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*srgb(hex_color), 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if vertex_colors:
        # Cor do material x cor de vértice: lábios e bochechas acompanham qualquer tom de pele.
        attr = nodes.new("ShaderNodeVertexColor")
        attr.layer_name = "Col"
        mix = nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0
        mix.inputs["A"].default_value = (*srgb(hex_color), 1.0)
        mat.node_tree.links.new(attr.outputs["Color"], mix.inputs["B"])
        mat.node_tree.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    return mat


def image_material(name, path, roughness=0.85):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = roughness
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    tex.image.pack()
    mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def plaid_texture():
    from PIL import Image, ImageDraw

    size = 256
    img = Image.new("RGB", (size, size), (150, 30, 32))
    d = ImageDraw.Draw(img, "RGBA")
    for k in range(0, size, 64):
        d.rectangle([k, 0, k + 24, size], fill=(25, 25, 30, 150))
        d.rectangle([0, k, size, k + 24], fill=(25, 25, 30, 150))
        d.rectangle([k + 40, 0, k + 44, size], fill=(240, 220, 200, 120))
        d.rectangle([0, k + 40, size, k + 44], fill=(240, 220, 200, 120))
    path = os.path.join(bpy.app.tempdir or "/tmp", "xadrez.png")
    img.save(path)
    return path


M = {}


def build_materials():
    M["Skin"] = material("Skin", "c98b62", roughness=0.5, vertex_colors=True)
    M["EyeWhite"] = material("EyeWhite", "efece6", roughness=0.15)
    M["Iris"] = material("Iris", "5a3a22", roughness=0.1)
    M["Pupil"] = material("Pupil", "0a0a0a", roughness=0.05)
    M["Lashes"] = material("Lashes", "1a1410", roughness=0.8)
    M["Hair"] = material("Hair", "2a1d16", roughness=0.55)
    M["Top"] = material("Top", "5a3f8c", roughness=0.92)
    M["Print"] = material("Print", "f5b942", roughness=0.8)
    M["Pants"] = material("Pants", "2b3550", roughness=0.85)
    M["Shoes"] = material("Shoes", "3b404a", roughness=0.6)
    M["ShoeSole"] = material("ShoeSole", "f7f6f0", roughness=0.75)
    M["ShoeAccent"] = material("ShoeAccent", "c0392b", roughness=0.6)
    M["Frame"] = material("Frame", "141414", roughness=0.3)
    M["Backpack"] = material("Backpack", "2f4a3a", roughness=0.85)
    M["Strap"] = material("Strap", "1c1c1c", roughness=0.8)
    M["Plaid"] = image_material("Plaid", plaid_texture())


# ---------------------------------------------------------------- malhas


def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def activate(obj):
    for o in bpy.context.selected_objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)


def apply_modifiers(obj):
    activate(obj)
    for mod in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)


def smooth(obj, angle=80):
    obj.data.shade_smooth()
    obj.data.set_sharp_from_angle(angle=math.radians(angle))


def mesh_from_faces(name, B, uvs, faces, mat):
    """Cria um objeto só com os vértices usados pelas faces (com UVs)."""
    used = sorted({i for f, _ in faces for i in f})
    remap = {old: new for new, old in enumerate(used)}
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([tuple(B[i]) for i in used], [], [[remap[i] for i in f] for f, _ in faces])
    uv_layer = mesh.uv_layers.new(name="UVMap")
    loop = 0
    for _, uv_idx in faces:
        for t in uv_idx:
            uv_layer.data[loop].uv = tuple(uvs[t])
            loop += 1
    mesh.validate()
    obj = link(bpy.data.objects.new(name, mesh))
    obj.data.materials.append(mat)
    return obj


def subdivide(obj, levels=1):
    mod = obj.modifiers.new("Subdiv", "SUBSURF")
    mod.levels = mod.render_levels = levels
    apply_modifiers(obj)


class Surface:
    """Pele de referência para as cascas: normais suavizadas e busca do ponto mais próximo."""

    def __init__(self, obj, smooth_iterations=3):
        from mathutils.bvhtree import BVHTree

        self.obj = obj
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bm.normal_update()
        bm.verts.ensure_lookup_table()
        normals = [v.normal.copy() for v in bm.verts]
        neighbors = [[e.other_vert(v).index for e in v.link_edges] for v in bm.verts]
        for _ in range(smooth_iterations):  # normais suaves: a roupa não "afunda" no umbigo nem nas axilas
            normals = [(normals[i] + sum((normals[j] for j in nb), Vector())).normalized() for i, nb in enumerate(neighbors)]
        self.normals = normals
        self.bvh = BVHTree.FromBMesh(bm)
        bm.free()


def shell(name, surface, select, thickness, mat, solid=0.003, flat_bottom=None, taper=3, edge_smoothing=8):
    """
    "Casca" sobre a pele: copia as faces cujos vértices passam em `select(co)` e as afasta
    `thickness(co)` ao longo da normal. O contorno é suavizado e reprojetado na pele, e a espessura
    afina nas `taper` primeiras fileiras a partir da borda, para a peça "nascer" da pele sem degrau.
    `flat_bottom` achata tudo abaixo de uma altura.
    """
    bm = bmesh.new()
    bm.from_mesh(surface.obj.data)
    orig = bm.verts.layers.int.new("orig")
    for v in bm.verts:
        v[orig] = v.index
    keep = {v.index for v in bm.verts if select(v.co)}
    drop = [f for f in bm.faces if not all(v.index in keep for v in f.verts)]
    bmesh.ops.delete(bm, geom=drop, context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    if not bm.verts:
        raise RuntimeError(f"Região vazia para {name}")

    boundary = [v for v in bm.verts if any(e.is_boundary for e in v.link_edges)]
    for _ in range(edge_smoothing):
        moved = {}
        for v in boundary:
            nb = [e.other_vert(v).co for e in v.link_edges if e.is_boundary]
            if len(nb) == 2:
                moved[v] = v.co * 0.5 + (nb[0] + nb[1]) * 0.25
        for v, co in moved.items():
            hit = surface.bvh.find_nearest(co)
            v.co = hit[0] if hit[0] is not None else co

    # Distância (em fileiras de arestas) até a borda, para afinar a espessura.
    hops = {v: 0 for v in boundary}
    frontier = list(boundary)
    for step in range(1, taper + 1):
        nxt = []
        for v in frontier:
            for e in v.link_edges:
                w = e.other_vert(v)
                if w not in hops:
                    hops[w] = step
                    nxt.append(w)
        frontier = nxt

    for v in bm.verts:
        f = min(1.0, hops.get(v, taper) / taper) if taper else 1.0
        f = f * f * (3 - 2 * f)
        n = surface.normals[v[orig]]
        offset = max(0.0008, thickness(v.co) * f)
        v.co = v.co + n * offset
        if flat_bottom is not None and v.co.z < flat_bottom:
            v.co.z = flat_bottom
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = link(bpy.data.objects.new(name, mesh))
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    if solid:
        mod = obj.modifiers.new("Solid", "SOLIDIFY")
        mod.thickness = solid
        mod.offset = -1
        apply_modifiers(obj)
    smooth(obj)
    return obj


def join(objects, name):
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    obj = bpy.context.active_object
    obj.name = name
    return obj


# ---------------------------------------------------------------- regiões do corpo


class Regions:
    """Funções de seleção por posição, a partir das articulações do MakeHuman."""

    def __init__(self, J):
        self.J = J
        self.eye_z = J["l-eye"].z
        self.neck_z = J["neck"].z
        self.mouth_z = 1.561
        self.hem_z = J["pelvis"].z + 0.02  # barra da blusa, no quadril
        self.waist_z = J["spine-4"].z + 0.03  # cós da calça
        self.ankle_z = J["l-ankle"].z

    def arm_param(self, co):
        """Para pontos do braço: (t ao longo de ombro->cotovelo->mão, distância ao osso). t=1 na mão."""
        s = 1 if co.x >= 0 else -1
        pts = [self.J["l-shoulder"].copy(), self.J["l-elbow"].copy(), self.J["l-hand"].copy()]
        for p in pts:
            p.x *= s
        lengths = [(pts[1] - pts[0]).length, (pts[2] - pts[1]).length]
        total = sum(lengths)
        best = (1e9, 0.0)
        for k in range(2):
            a, b = pts[k], pts[k + 1]
            axis = b - a
            u = (co - a).dot(axis) / axis.length_squared
            dist = (co - (a + axis * max(0.0, min(1.0, u)))).length
            t = (sum(lengths[:k]) + u * lengths[k]) / total
            if dist < best[0]:
                best = (dist, t)
        return best[1], best[0]

    def is_arm(self, co):
        t, dist = self.arm_param(co)
        return t > 0.08 and dist < 0.09 and abs(co.x) > 0.15

    def head(self, co):
        return co.z > self.neck_z + 0.02

    def scalp(self, co, tight=False):
        """Couro cabeludo: acima da linha do cabelo, que desce da testa para a nuca, sem as orelhas."""
        if not self.head(co):
            return False
        front, back = -0.15, 0.08
        t = max(0.0, min(1.0, (co.y - front) / (back - front)))  # 0 = testa, 1 = nuca
        line = 1.695 - 0.075 * t - 0.07 * t * t
        side = abs(co.x)
        if side > 0.055:  # nas laterais a linha do cabelo sobe por cima das orelhas
            line = max(line, 1.655 - (0.05 if co.y > 0.02 else 0.0))
        if tight:
            line += 0.005
        ear = side > 0.06 and -0.06 < co.y < 0.035 and co.z < 1.665
        return co.z > line and not ear

    def beard(self, co):
        if not self.head(co) and not (co.y < -0.04 and co.z > self.neck_z - 0.04):
            return False
        if co.y > -0.01:
            return False
        depth = max(0.0, min(1.0, (-co.y - 0.01) / 0.12))
        upper = 1.635 - 0.06 * depth  # linha das bochechas: da costeleta até o canto da boca
        if abs(co.x) < 0.036:
            upper = min(upper, self.mouth_z + 0.004)  # no centro, só abaixo da boca (o bigode é à parte)
        lips = abs(co.x) < 0.03 and abs(co.z - self.mouth_z) < 0.013 and co.y < -0.12
        ear = abs(co.x) > 0.055 and co.y > -0.05 and co.z > 1.5
        return co.z < upper and not lips and not ear

    def mustache(self, co):
        nose = abs(co.x) < 0.016 and co.z > self.mouth_z + 0.015
        return abs(co.x) < 0.034 and self.mouth_z + 0.005 < co.z < self.mouth_z + 0.019 and co.y < -0.115 and not nose

    def brow(self, co):
        if co.y > -0.1:
            return False
        for s in (1, -1):
            cx = s * 0.037
            dz = co.z - (self.eye_z + 0.028 - 0.15 * (abs(co.x) - 0.037) ** 2 * 10)
            if ((co.x - cx) / 0.026) ** 2 + (dz / 0.0055) ** 2 < 1:
                return True
        return False

    def lips(self, co):
        return co.y < -0.118 and (co.x / 0.024) ** 2 + ((co.z - self.mouth_z) / 0.0095) ** 2 < 1

    def top(self, co, sleeve_t=0.86, neck_drop=0.0):
        if self.is_arm(co):
            t, _ = self.arm_param(co)
            return t < sleeve_t
        if abs(co.x) > 0.3:
            return False
        # Gola: o recorte é só em volta do pescoço; ombros ficam cobertos.
        neckline = self.neck_z - 0.025 - neck_drop - (0.012 if co.y < self.J["neck"].y else 0.0)
        if abs(co.x) > 0.075 and co.y > -0.075:  # ombros (fora do pescoço e longe do queixo)
            neckline = self.neck_z + 0.03
        return self.hem_z < co.z < neckline

    def pants(self, co):
        return abs(co.x) < 0.26 and not self.is_arm(co) and self.ankle_z + 0.035 < co.z < self.waist_z

    def foot(self, co):
        return co.z < self.ankle_z + 0.05 and abs(co.x) > 0.06


# ---------------------------------------------------------------- partes


def build_body(B, uvs, groups, R):
    body = mesh_from_faces("Body", B, uvs, groups["body"], M["Skin"])
    subdivide(body, 1)
    smooth(body)
    # Cor de vértice: lábios e bochechas levemente diferentes da pele.
    colors = body.data.color_attributes.new("Col", "BYTE_COLOR", "POINT")
    for v in body.data.vertices:
        c = (1.0, 1.0, 1.0)
        if R.lips(v.co):
            c = (0.88, 0.7, 0.68)
        elif R.head(v.co) and v.co.y < -0.08 and abs(abs(v.co.x) - 0.05) < 0.02 and abs(v.co.z - 1.585) < 0.02:
            c = (1.0, 0.95, 0.93)  # bochechas
        colors.data[v.index].color = (*c, 1.0)
    return body


def build_eyes(B, uvs, groups, J):
    parts = []
    for side in ("l", "r"):
        eye = mesh_from_faces(f"Eye_{side}", B, uvs, groups[f"helper-{side}-eye"], M["EyeWhite"])
        subdivide(eye, 2)
        smooth(eye)
        center = Vector(np.array([v.co for v in eye.data.vertices]).mean(axis=0))
        radius = max((v.co - center).length for v in eye.data.vertices)
        look = (J[f"{side}-eye-target"] - J[f"{side}-eye"]).normalized()
        for r, mat, depth in ((radius * 0.48, M["Iris"], 0.92), (radius * 0.2, M["Pupil"], 0.985)):
            bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1, location=center + look * radius * depth)
            disc = bpy.context.active_object
            disc.scale = (r, r, radius * 0.12)
            disc.rotation_mode = "QUATERNION"
            disc.rotation_quaternion = look.to_track_quat("Z", "Y")
            disc.data.materials.append(mat)
            smooth(disc)
            parts.append(disc)
        parts.append(eye)
        # Só os cílios de cima: os de baixo, sem textura com transparência, parecem lápis de olho.
        lash_groups = [groups[f"helper-{side}-eyelashes-{k}"] for k in (1, 2)]
        upper = max(lash_groups, key=lambda faces: np.mean([B[i][2] for f, _ in faces for i in f]))
        parts.append(mesh_from_faces(f"Lashes_{side}", B, uvs, upper, M["Lashes"]))
    return join(parts, "Eyes")


def curve_object(name, points, radii, bevel, mat, extrude=0.0):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for bp, co, r in zip(spline.bezier_points, points, radii):
        bp.co = co
        bp.radius = r
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    curve.bevel_depth = bevel
    curve.bevel_resolution = 6
    curve.extrude = extrude
    obj = link(bpy.data.objects.new(name, curve))
    activate(obj)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.active_object
    obj.data.materials.append(mat)
    smooth(obj, 40)
    return obj


def build_hairs(skin, R):
    hairs = []
    hairs.append(
        shell("Hair_Curto", skin,
            R.scalp,
            lambda co: 0.007 + 0.006 * max(0, co.z - 1.68) * 30,
            M["Hair"],
        )
    )
    hairs.append(
        shell("Hair_Cacheado", skin,
            R.scalp,
            lambda co: 0.022 + 0.02 * max(0, co.z - 1.62) * 8,
            M["Hair"],
        )
    )
    tight = lambda co: R.scalp(co, tight=True)  # noqa: E731
    # Coque: cabelo rente + bola no alto da nuca.
    cap = shell("Hair_Coque", skin, tight, lambda co: 0.005, M["Hair"])
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.048, location=(0, 0.075, 1.735))
    bun = bpy.context.active_object
    bun.scale = (1.0, 0.85, 0.85)
    bun.data.materials.append(M["Hair"])
    smooth(bun)
    hairs.append(join([cap, bun], "Hair_Coque"))
    # Rabo de cavalo: cabelo rente + mecha presa atrás.
    cap2 = shell("Hair_Rabo", skin, tight, lambda co: 0.006, M["Hair"])
    tail = curve_object("Ponytail", [(0, 0.085, 1.66), (0, 0.11, 1.6), (0, 0.105, 1.52), (0, 0.09, 1.45)], (1.0, 1.2, 0.9, 0.35), 0.028, M["Hair"])
    hairs.append(join([cap2, tail], "Hair_Rabo"))
    return hairs


def build_beards(skin, R):
    beard = shell("Beard_Cheia", skin,
        lambda co: R.beard(co) or R.mustache(co),
        lambda co: 0.006 + max(0, 1.53 - co.z) * 0.12,
        M["Hair"],
    )
    mustache = shell("Beard_Bigode", skin, R.mustache, lambda co: 0.005, M["Hair"])
    return [beard, mustache]


def build_brows(skin, R):
    return shell("Brows", skin, R.brow, lambda co: 0.0015, M["Hair"], solid=0.0015)


def extreme_y(body, R, z, x=0.0, width=0.03, back=False):
    ys = [v.co.y for v in body.data.vertices if abs(v.co.z - z) < 0.01 and abs(v.co.x - x) < width and not R.is_arm(v.co)]
    return max(ys) if back else min(ys)


def build_tops(skin, R):
    hoodie = shell("Top_Moletom", skin,
        lambda co: R.top(co, 0.97),
        lambda co: 0.02 + (0.008 if R.is_arm(co) else 0.0),
        M["Top"],
    )
    # Punhos e barra em ribana.
    cuffs = shell("Cuffs", skin, lambda co: R.is_arm(co) and 0.91 < R.arm_param(co)[0] < 0.97, lambda co: 0.016, M["Top"], solid=0.008)
    hem = shell("Hem", skin,
        lambda co: R.hem_z < co.z < R.hem_z + 0.045 and not R.is_arm(co) and abs(co.x) < 0.27,
        lambda co: 0.014,
        M["Top"],
        solid=0.006,
    )
    # Estampa </> no peito.
    chest_z = 1.27
    bpy.ops.object.text_add(location=(0, extreme_y(skin.obj, R, chest_z, width=0.05) - 0.019, chest_z), rotation=(math.pi / 2, 0, 0))
    text = bpy.context.active_object
    text.data.body = "</>"
    text.data.size = 0.075
    text.data.align_x = "CENTER"
    text.data.align_y = "CENTER"
    text.data.extrude = 0.0015
    bpy.ops.object.convert(target="MESH")
    text = bpy.context.active_object
    text.data.materials.append(M["Print"])
    tops = [join([hoodie, cuffs, hem, text], "Top_Moletom")]

    tops.append(shell("Top_Camiseta", skin, lambda co: R.top(co, 0.32, neck_drop=0.01), lambda co: 0.016, M["Top"]))

    shirt = shell("Top_Xadrez", skin, lambda co: R.top(co, 0.96), lambda co: 0.017, M["Plaid"])
    collar = shell("Collar", skin,
        lambda co: R.neck_z - 0.05 < co.z < R.neck_z - 0.02 and not R.is_arm(co),
        lambda co: 0.016,
        M["Plaid"],
        solid=0.006,
    )
    tops.append(join([shirt, collar], "Top_Xadrez"))
    activate(tops[-1])
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.cube_project(cube_size=0.35)
    bpy.ops.object.mode_set(mode="OBJECT")
    return tops


def build_pants(skin, R):
    def pants_fit(co):
        below_knee = max(0.0, min(1.0, (0.55 - co.z) / 0.35))
        crotch = max(0.0, 1.0 - math.hypot(co.x / 0.09, (co.z - 0.84) / 0.08))
        waist = max(0.0, min(1.0, (co.z - 0.9) / 0.05))  # perto da cintura, rente (a blusa vai por cima)
        return (0.015 + 0.014 * below_knee + 0.02 * crotch) * (1 - waist) + 0.009 * waist

    pants = shell("Pants", skin, R.pants, pants_fit, M["Pants"])
    band = shell("Waistband", skin,
        lambda co: R.waist_z - 0.035 < co.z < R.waist_z and abs(co.x) < 0.26 and not R.is_arm(co),
        lambda co: 0.011,
        M["Pants"],
        solid=0.005,
    )
    return join([pants, band], "Pants")


def convex_hull_2d(points):
    """Envoltória convexa (algoritmo da cadeia monótona), em sentido anti-horário."""
    pts = sorted(set(points))

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def build_shoes(skin, R):
    verts = skin.obj.data.vertices
    upper = shell(
        "ShoeUpper",
        skin,
        R.foot,
        lambda co: 0.017 + (0.008 if co.z < 0.035 else 0.0) + (0.004 if co.y < -0.17 else 0.0),
        M["Shoes"],
        solid=0.004,
        flat_bottom=0.026,
    )
    parts = [upper]
    for s in (1, -1):
        # Sola: contorno do pé no chão (envoltória convexa), um pouco maior, extrudado.
        pts = [(v.co.x, v.co.y) for v in verts if R.foot(v.co) and v.co.z < 0.04 and (v.co.x > 0) == (s > 0)]
        hull = convex_hull_2d(pts)
        cx = sum(p[0] for p in hull) / len(hull)
        cy = sum(p[1] for p in hull) / len(hull)
        bm = bmesh.new()
        ring = [bm.verts.new((cx + (x - cx) * 1.16, cy + (y - cy) * 1.1, 0.0)) for x, y in hull]
        face = bm.faces.new(ring)
        ext = bmesh.ops.extrude_face_region(bm, geom=[face])
        for v in [g for g in ext["geom"] if isinstance(g, bmesh.types.BMVert)]:
            v.co.z = 0.032
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        mesh = bpy.data.meshes.new(f"Sole{s}")
        bm.to_mesh(mesh)
        bm.free()
        sole = link(bpy.data.objects.new(f"Sole{s}", mesh))
        sole.data.materials.append(M["ShoeSole"])
        bevel = sole.modifiers.new("Bevel", "BEVEL")
        bevel.width = 0.008
        bevel.segments = 4
        apply_modifiers(sole)
        smooth(sole, 50)
        parts.append(sole)
        # Detalhe vermelho só na lateral de fora do tênis.
        outer_x = max(abs(v.co.x) for v in verts if R.foot(v.co) and (v.co.x > 0) == (s > 0))
        parts.append(
            shell(
                f"Accent{s}",
                skin,
                lambda co, s=s, ox=outer_x: R.foot(co)
                and (co.x > 0) == (s > 0)
                and abs(co.x) > ox - 0.03
                and 0.035 < co.z < 0.07
                and -0.17 < co.y < -0.04,
                lambda co: 0.0235,
                M["ShoeAccent"],
                solid=0.002,
            )
        )
    return join(parts, "Shoes")


def build_glasses(J):
    parts = []
    y = min(J["l-eye"].y, J["r-eye"].y) - 0.033
    z = J["l-eye"].z + 0.002
    ex = abs(J["l-eye"].x)
    for s in (1, -1):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.021, minor_radius=0.0022, major_segments=40, minor_segments=8, location=(s * ex, y, z), rotation=(math.pi / 2, 0, 0))
        parts.append(bpy.context.active_object)
        ear_y = 0.005
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.0018, depth=ear_y - y, location=(s * 0.071, (y + ear_y) / 2, z + 0.004), rotation=(math.pi / 2, 0, 0))
        parts.append(bpy.context.active_object)
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.0018, depth=2 * ex - 0.042, location=(0, y, z + 0.006), rotation=(0, math.pi / 2, 0))
    parts.append(bpy.context.active_object)
    for p in parts:
        p.data.materials.append(M["Frame"])
    glasses = join(parts, "Glasses_Redondo")
    smooth(glasses)
    return glasses


def build_backpack(skin, R):
    yb = extreme_y(skin.obj, R, 1.25, width=0.08, back=True)
    parts = []

    def box(name, size, loc, mat, bevel):
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = size
        bpy.ops.object.transform_apply(scale=True)
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 5
        apply_modifiers(obj)
        obj.data.materials.append(mat)
        smooth(obj, 40)
        return obj

    parts.append(box("Bag", (0.29, 0.12, 0.4), (0, yb + 0.085, 1.21), M["Backpack"], 0.045))
    parts.append(box("Pocket", (0.21, 0.04, 0.15), (0, yb + 0.16, 1.11), M["Backpack"], 0.02))
    parts.append(box("Sticker1", (0.055, 0.004, 0.055), (0.07, yb + 0.147, 1.33), M["Print"], 0.008))
    parts.append(box("Sticker2", (0.045, 0.004, 0.045), (-0.075, yb + 0.147, 1.26), M["ShoeAccent"], 0.008))

    # Alças: faixas por cima da roupa (geradas da pele, então acompanham ombro e peito).
    def strap(co):
        if R.is_arm(co) or abs(abs(co.x) - 0.09) > 0.02:
            return False
        return 1.15 < co.z < 1.53 if co.y > 0 else 1.24 < co.z < 1.53

    parts.append(shell("Straps", skin, strap, lambda co: 0.034, M["Strap"], solid=0.005, taper=0, edge_smoothing=4))
    for s in (1, -1):
        yf = extreme_y(skin.obj, R, 1.26, x=s * 0.09, width=0.02)
        parts.append(box(f"Buckle{s}", (0.032, 0.01, 0.026), (s * 0.09, yf - 0.04, 1.265), M["Frame"], 0.004))
    return join(parts, "Backpack")


# ---------------------------------------------------------------- esqueleto e pose


def bone_specs(J):
    """(nome, cabeça, cauda, pai). Nomes no padrão do Blender (.L/.R) para animar depois."""
    specs = [
        ("hips", J["pelvis"], J["spine-4"], None),
        ("spine", J["spine-4"], J["spine-3"], "hips"),
        ("spine1", J["spine-3"], J["spine-2"], "spine"),
        ("chest", J["spine-2"], J["spine-1"], "spine1"),
        ("upper_chest", J["spine-1"], J["neck"], "chest"),
        ("neck", J["neck"], J["head"], "upper_chest"),
        ("head", J["head"], J["head-2"], "neck"),
    ]
    for side, tag in (("l", "L"), ("r", "R")):
        j = lambda name: J[f"{side}-{name}"]  # noqa: E731
        specs += [
            (f"shoulder.{tag}", j("clavicle"), j("shoulder"), "upper_chest"),
            (f"upper_arm.{tag}", j("shoulder"), j("elbow"), f"shoulder.{tag}"),
            (f"forearm.{tag}", j("elbow"), j("hand"), f"upper_arm.{tag}"),
            (f"hand.{tag}", j("hand"), j("finger-3-1"), f"forearm.{tag}"),
            (f"thigh.{tag}", j("upper-leg"), j("knee"), "hips"),
            (f"shin.{tag}", j("knee"), j("ankle"), f"thigh.{tag}"),
            (f"foot.{tag}", j("ankle"), j("foot-1"), f"shin.{tag}"),
            (f"toe.{tag}", j("foot-1"), j("foot-2"), f"foot.{tag}"),
        ]
        for f in range(1, 6):
            for k in range(1, 4):
                parent = f"hand.{tag}" if k == 1 else f"finger{f}_{k - 1}.{tag}"
                specs.append((f"finger{f}_{k}.{tag}", j(f"finger-{f}-{k}"), j(f"finger-{f}-{k + 1}"), parent))
    return specs


def build_rig(J, body, others, rigid_head, rigid_chest):
    """
    Cria o esqueleto, pesa o corpo (pesos automáticos), copia os pesos para roupas e cabelos, baixa os
    braços para uma pose relaxada e torna essa pose o novo repouso (o jogo parte dela para animar).
    """
    arm_data = bpy.data.armatures.new("DevRig")
    rig = link(bpy.data.objects.new("DevRig", arm_data))
    activate(rig)
    bpy.ops.object.mode_set(mode="EDIT")
    for name, head, tail, parent in bone_specs(J):
        bone = arm_data.edit_bones.new(name)
        bone.head, bone.tail = head, tail
        if (bone.tail - bone.head).length < 1e-4:
            bone.tail = bone.head + Vector((0, 0, 0.01))
        if parent:
            bone.parent = arm_data.edit_bones[parent]
            bone.use_connect = False
    bpy.ops.object.mode_set(mode="OBJECT")

    # Corpo: pesos automáticos (difusão de calor a partir dos ossos). A difusão falha em malhas
    # pequenas, então o cálculo é feito com tudo 10x maior e depois volta ao tamanho real.
    def rescale(factor):
        for obj in (rig, body):
            activate(obj)
            obj.scale = (factor, factor, factor)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    rescale(10)
    for o in bpy.context.selected_objects:
        o.select_set(False)
    body.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    rescale(0.1)
    body.parent = rig
    body.matrix_parent_inverse.identity()
    counts = {g.name: 0 for g in body.vertex_groups}
    for v in body.data.vertices:
        for ge in v.groups:
            if ge.weight > 0.01:
                counts[body.vertex_groups[ge.group].name] += 1
    empty = [name for name, n in counts.items() if n == 0]
    print("Pesos: upper_arm.L", counts.get("upper_arm.L"), "thigh.L", counts.get("thigh.L"), "head", counts.get("head"), "ossos sem peso:", empty)

    # Roupas e cabelos: copiam os pesos do ponto mais próximo da pele.
    for obj in others:
        if obj in rigid_head or obj in rigid_chest:
            group = obj.vertex_groups.new(name="head" if obj in rigid_head else "chest")
            group.add([v.index for v in obj.data.vertices], 1.0, "REPLACE")
        else:
            mod = obj.modifiers.new("Weights", "DATA_TRANSFER")
            mod.object = body
            mod.use_vert_data = True
            mod.data_types_verts = {"VGROUP_WEIGHTS"}
            mod.vert_mapping = "POLYINTERP_NEAREST"
            mod.layers_vgroup_select_src = "ALL"
            mod.layers_vgroup_select_dst = "NAME"
            activate(obj)
            bpy.ops.object.datalayout_transfer(modifier=mod.name)
            bpy.ops.object.modifier_apply(modifier=mod.name)
        arm_mod = obj.modifiers.new("Armature", "ARMATURE")
        arm_mod.object = rig
        obj.parent = rig

    # Pose relaxada: braços ao lado do corpo, cotovelo levemente dobrado.
    activate(rig)
    bpy.ops.object.mode_set(mode="POSE")
    from mathutils import Matrix

    def rotate(bone_name, angle_deg, axis):
        pb = rig.pose.bones[bone_name]
        pivot = pb.head.copy()
        R = Matrix.Translation(pivot) @ Matrix.Rotation(math.radians(angle_deg), 4, axis) @ Matrix.Translation(-pivot)
        pb.matrix = R @ pb.matrix
        bpy.context.view_layer.update()

    for tag, sign in (("L", 1), ("R", -1)):
        rotate(f"upper_arm.{tag}", sign * 36, Vector((0, 1, 0)))
        rotate(f"upper_arm.{tag}", 6, Vector((1, 0, 0)))  # um pouco para a frente
        rotate(f"forearm.{tag}", 10, Vector((1, 0, 0)))
    bpy.ops.object.mode_set(mode="OBJECT")

    # Aplica a pose nas malhas e faz dela o novo repouso.
    for mod in body.modifiers:
        mod.name = "Armature"
        mod.object = rig
    for obj in [body, *others]:
        activate(obj)
        bpy.ops.object.modifier_apply(modifier="Armature")
    activate(rig)
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.armature_apply()
    bpy.ops.object.mode_set(mode="OBJECT")
    for obj in [body, *others]:
        mod = obj.modifiers.new("Armature", "ARMATURE")
        mod.object = rig
    return rig



# ---------------------------------------------------------------- montagem


def main():
    obj_path, npz_path = ensure_assets()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_materials()
    B, uvs, groups, J = load_base(obj_path, npz_path)
    R = Regions(J)

    body = build_body(B, uvs, groups, R)
    skin = Surface(body)
    objects = [body, build_eyes(B, uvs, groups, J), build_brows(skin, R), build_pants(skin, R), build_shoes(skin, R)]
    objects += build_hairs(skin, R)
    objects += build_beards(skin, R)
    objects += build_tops(skin, R)
    objects += [build_glasses(J), build_backpack(skin, R)]

    others = objects[1:]
    head_items = [o for o in others if o.name.startswith(("Eyes", "Brows", "Hair_", "Beard_", "Glasses_"))]
    chest_items = [o for o in others if o.name == "Backpack"]
    rig = build_rig(J, body, others, head_items, chest_items)
    rig.name = "Dev"

    bpy.context.view_layer.update()
    tris = {}
    for o in objects:
        o.data.calc_loop_triangles()
        tris[o.name] = len(o.data.loop_triangles)
    print("Triângulos:", ", ".join(f"{k}={v}" for k, v in tris.items()))
    print(f"Altura: {max(v.co.z for v in body.data.vertices):.2f} m")

    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.abspath(OUT),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_vertex_color="ACTIVE",
    )
    print(f"OK {OUT}")


main()
