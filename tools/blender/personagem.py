"""
Modela o dev (personagem principal) com todas as variações de personalização e exporta em glTF.

    python tools/blender/personagem.py public/models/personagem/dev.glb

Convenções:
- Blender: Z para cima, personagem olhando para -Y (no glTF/Three.js: olhando para +Z). Altura ~1,75 m.
- Corpo feito com o modificador Skin (esqueleto de pontos com espessura) + subdivisão: mãos com cinco
  dedos de três falanges, polegar opositor e pés. Cabeça e cabelos feitos com metaballs.
- Variações com nome fixo, para o jogo ligar/desligar: Hair_Curto, Hair_Cacheado, Hair_Coque,
  Hair_Longo, Beard_Cheia, Beard_Bigode, Glasses_Redondo, Top_Moletom, Top_Camiseta, Top_Xadrez,
  Backpack. Sempre visíveis: Body, Head, Eyes, Pants, Shoes.
- Materiais com nome fixo (cor trocada no jogo): Skin, Hair, Top, Pants, Shoes, ShoeSole, Backpack.
"""

import math
import os
import random
import sys

import bpy  # precisa vir antes: registra os módulos bmesh e mathutils

from mathutils import Vector  # noqa: E402

OUT = sys.argv[-1] if sys.argv[-1].endswith(".glb") else "dev.glb"
rng = random.Random(7)


# ---------------------------------------------------------------- utilidades


def srgb(hex_color):
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i : i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


def material(name, hex_color, roughness=0.6, metallic=0.0, sheen=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*srgb(hex_color), 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if sheen:
        bsdf.inputs["Sheen Weight"].default_value = sheen
    return mat


M = {}


def build_materials():
    M["Skin"] = material("Skin", "c98b62", roughness=0.55)
    M["Lips"] = material("Lips", "a5604a", roughness=0.5)
    M["EyeWhite"] = material("EyeWhite", "f2efe8", roughness=0.2)
    M["Iris"] = material("Iris", "4a2e1c", roughness=0.15)
    M["Pupil"] = material("Pupil", "0c0c0c", roughness=0.1)
    M["Hair"] = material("Hair", "2a1d16", roughness=0.65)
    M["Top"] = material("Top", "5a3f8c", roughness=0.9)
    M["Print"] = material("Print", "f5b942", roughness=0.8)
    M["Pants"] = material("Pants", "2b3550", roughness=0.85)
    M["Shoes"] = material("Shoes", "e8e8e8", roughness=0.6)
    M["ShoeSole"] = material("ShoeSole", "f7f7f2", roughness=0.7)
    M["ShoeAccent"] = material("ShoeAccent", "c0392b", roughness=0.6)
    M["Frame"] = material("Frame", "141414", roughness=0.3)
    M["Backpack"] = material("Backpack", "2f4a3a", roughness=0.85)
    M["Strap"] = material("Strap", "1c1c1c", roughness=0.8)
    M["Plaid"] = plaid_material()


def plaid_material():
    """Camisa xadrez de flanela (o uniforme não oficial do dev), desenhada com Pillow."""
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
    mat = bpy.data.materials.new("Plaid")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.9
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    tex.image.pack()
    mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


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


def smooth(obj, angle=60):
    obj.data.shade_smooth()
    obj.data.set_sharp_from_angle(angle=math.radians(angle))


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


def box_uv(obj, scale=1.0):
    """Projeção UV automática (necessária para a textura xadrez)."""
    activate(obj)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.cube_project(cube_size=scale)
    bpy.ops.object.mode_set(mode="OBJECT")


# ---------------------------------------------------------------- esqueleto + Skin


class Skeleton:
    """Grafo de pontos com espessura (raio x, raio y) que o modificador Skin transforma em malha."""

    def __init__(self):
        self.verts = []
        self.radii = []
        self.edges = []

    def add(self, co, radius, parent=None):
        self.verts.append(co)
        self.radii.append(radius if isinstance(radius, tuple) else (radius, radius))
        index = len(self.verts) - 1
        if parent is not None:
            self.edges.append((parent, index))
        return index

    def chain(self, parent, points):
        last = parent
        for co, r in points:
            last = self.add(co, r, last)
        return last

    def build(self, name, mat, subdiv=2):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(self.verts, self.edges, [])
        obj = link(bpy.data.objects.new(name, mesh))
        skin = obj.modifiers.new("Skin", "SKIN")
        skin.use_smooth_shade = True
        for i, r in enumerate(self.radii):
            obj.data.skin_vertices[0].data[i].radius = r
        obj.data.skin_vertices[0].data[0].use_root = True
        sub = obj.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = sub.render_levels = subdiv
        apply_modifiers(obj)
        obj.data.materials.append(mat)
        smooth(obj, 80)
        return obj


def torso_and_limbs(sk, grow=0.0, arms_to="hand", legs_to="foot", top=1.5):
    """Tronco, braços e pernas. `grow` engorda tudo (roupas por cima do corpo)."""
    g = grow
    pelvis = sk.add((0, 0, 0.95), (0.15 + g, 0.1 + g))
    waist = sk.add((0, 0.0, 1.08), (0.135 + g, 0.09 + g), pelvis)
    chest = sk.add((0, -0.005, 1.27), (0.165 + g, 0.1 + g), waist)
    upper = sk.add((0, 0.0, 1.39), (0.15 + g, 0.09 + g), chest)
    if top >= 1.5:
        neck = sk.add((0, 0.005, 1.5), (0.052 + g * 0.6, 0.052 + g * 0.6), upper)
        if top >= 1.56:
            sk.add((0, 0.008, 1.56), (0.048, 0.048), neck)
    ends = {}
    for s in (1, -1):
        shoulder = sk.add((s * 0.175, 0.0, 1.405), (0.062 + g, 0.06 + g), upper)
        arm = [
            ((s * 0.225, 0.0, 1.27), 0.05 + g),
            ((s * 0.262, 0.0, 1.13), 0.043 + g),
        ]
        if arms_to == "short":
            ends[s] = sk.chain(shoulder, arm[:1])
        else:
            last = sk.chain(shoulder, arm + [((s * 0.288, -0.008, 1.0), 0.039 + g), ((s * 0.306, -0.014, 0.89), (0.028 + g, 0.024 + g))])
            if arms_to == "hand":
                hand(sk, last, s)
            ends[s] = last
        if legs_to == "none":
            continue
        hip = sk.add((s * 0.095, 0.0, 0.92), (0.086 + g, 0.086 + g), pelvis)
        leg = [
            ((s * 0.1, 0.0, 0.72), 0.076 + g),
            ((s * 0.104, 0.0, 0.5), 0.056 + g),
            ((s * 0.104, 0.006, 0.32), 0.056 + g),
            ((s * 0.104, 0.0, 0.12 if legs_to == "ankle" else 0.09), 0.04 + g),
        ]
        last_leg = sk.chain(hip, leg)
        if legs_to == "foot":
            sk.add((s * 0.104, -0.09, 0.04), (0.036, 0.03), last_leg)
    return ends


def hand(sk, wrist, s):
    """Mão com palma achatada, quatro dedos de três falanges e polegar opositor."""
    palm = sk.add((s * 0.316, -0.02, 0.835), (0.017, 0.04), wrist)
    for k, y in enumerate((-0.044, -0.021, 0.002, 0.024)):  # indicador na frente (-Y)
        length = (0.029, 0.021, 0.017) if k in (1, 2) else (0.025, 0.018, 0.015)
        if k == 3:
            length = (0.021, 0.015, 0.013)  # mindinho
        base = sk.add((s * 0.322, y, 0.8), 0.0088, palm)
        z = 0.8
        x = s * 0.322
        r = 0.0084
        last = base
        for seg in length:
            z -= seg
            x -= s * 0.004  # leve curvatura para dentro, mão relaxada
            r -= 0.0006
            last = sk.add((x, y - 0.002, z), r, last)
    thumb_base = sk.add((s * 0.31, -0.05, 0.852), 0.012, palm)
    sk.chain(thumb_base, [((s * 0.306, -0.074, 0.828), 0.0102), ((s * 0.302, -0.09, 0.805), 0.0088)])


def build_body():
    sk = Skeleton()
    torso_and_limbs(sk)
    return sk.build("Body", M["Skin"])


# ---------------------------------------------------------------- cabeça (metaballs)


def metaball_object(name, elements, mat, resolution=0.006, threshold=0.6):
    """elements: (tipo, posição, raio, tamanho_xyz, negativo)."""
    mb = bpy.data.metaballs.new(name)
    mb.resolution = resolution
    mb.render_resolution = resolution
    mb.threshold = threshold
    obj = link(bpy.data.objects.new(name, mb))
    for kind, co, radius, size, negative in elements:
        el = mb.elements.new(type=kind)
        el.co = co
        el.radius = radius
        el.use_negative = negative
        if kind in ("ELLIPSOID", "CAPSULE", "CUBE"):
            el.size_x, el.size_y, el.size_z = size
    bpy.context.view_layer.update()
    activate(obj)
    bpy.ops.object.convert(target="MESH")
    mesh_obj = bpy.context.active_object
    mesh_obj.name = name
    mesh_obj.data.materials.clear()
    mesh_obj.data.materials.append(mat)
    smooth(mesh_obj, 80)
    return mesh_obj


HEAD_Z = 1.64


def build_head():
    z = HEAD_Z
    E = "ELLIPSOID"
    elements = [
        (E, (0, 0.005, z + 0.015), 0.13, (0.92, 1.0, 1.05), False),  # crânio
        (E, (0, -0.025, z - 0.06), 0.1, (0.88, 0.9, 0.85), False),  # mandíbula
        ("BALL", (0, -0.06, z - 0.095), 0.045, (1, 1, 1), False),  # queixo
        ("BALL", (0.045, -0.06, z - 0.03), 0.038, (1, 1, 1), False),  # bochechas
        ("BALL", (-0.045, -0.06, z - 0.03), 0.038, (1, 1, 1), False),
        (E, (0, -0.1, z - 0.01), 0.026, (0.6, 0.9, 1.15), False),  # nariz
        (E, (0.1, 0.005, z - 0.005), 0.05, (0.5, 0.7, 1.0), False),  # orelhas, coladas no crânio
        (E, (-0.1, 0.005, z - 0.005), 0.05, (0.5, 0.7, 1.0), False),
        ("CAPSULE", (0, 0.01, z - 0.12), 0.055, (0.03, 1, 1), False),  # pescoço (funde com o corpo)
        ("BALL", (0.038, -0.11, z + 0.012), 0.018, (1, 1, 1), True),  # órbitas dos olhos
        ("BALL", (-0.038, -0.11, z + 0.012), 0.018, (1, 1, 1), True),
    ]
    head = metaball_object("Head", elements, M["Skin"])

    parts = []
    for s in (1, -1):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.0118, location=(s * 0.036, -0.093, z + 0.012))
        eye = bpy.context.active_object
        eye.data.materials.append(M["EyeWhite"])
        smooth(eye)
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.0062, depth=0.002, location=(s * 0.036, -0.1046, z + 0.011), rotation=(math.pi / 2, 0, 0))
        iris = bpy.context.active_object
        iris.data.materials.append(M["Iris"])
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.0029, depth=0.002, location=(s * 0.036, -0.1055, z + 0.011), rotation=(math.pi / 2, 0, 0))
        pupil = bpy.context.active_object
        pupil.data.materials.append(M["Pupil"])
        # Pálpebra superior: meia casca de pele cobrindo o topo do olho (tira o olhar de "boneco").
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.0128, location=(s * 0.036, -0.093, z + 0.012))
        lid = bpy.context.active_object
        import bmesh

        bm = bmesh.new()
        bm.from_mesh(lid.data)
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 0.0035), plane_no=(0, -0.35, 1), clear_inner=True)
        bm.to_mesh(lid.data)
        bm.free()
        lid.data.materials.append(M["Skin"])
        smooth(lid)
        parts.append(lid)
        # Sobrancelha: cápsula curva achatada.
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=1, location=(s * 0.04, -0.103, z + 0.04))
        brow = bpy.context.active_object
        brow.scale = (0.022, 0.006, 0.005)
        brow.rotation_euler = (0, s * math.radians(-8), 0)
        brow.data.materials.append(M["Hair"])
        smooth(brow)
        parts += [eye, iris, pupil, brow]
    # Lábios.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=(0, -0.103, z - 0.055))
    lips = bpy.context.active_object
    lips.scale = (0.026, 0.008, 0.0065)
    lips.data.materials.append(M["Lips"])
    smooth(lips)
    parts.append(lips)
    eyes = join(parts, "Eyes")
    return head, eyes


# ---------------------------------------------------------------- cabelos, barbas e óculos


def hair_cap(extra):
    """Calota de cabelo sobre o crânio, com a testa e o rosto recortados por metaballs negativas."""
    z = HEAD_Z
    E = "ELLIPSOID"
    base = [
        (E, (0, 0.012, z + 0.03), 0.142, (0.93, 1.02, 1.0), False),
        (E, (0, -0.1, z - 0.04), 0.15, (1.1, 0.9, 0.9), True),  # rosto
        (E, (0, 0.02, z - 0.16), 0.17, (1.2, 1.3, 0.7), True),  # nuca e pescoço
        (E, (0.13, 0.0, z - 0.02), 0.068, (0.8, 1.0, 1.1), True),  # orelhas livres
        (E, (-0.13, 0.0, z - 0.02), 0.068, (0.8, 1.0, 1.1), True),
    ]
    return base + extra


def build_hairs():
    z = HEAD_Z
    hairs = []
    clumps = []
    for _ in range(10):  # tufos bagunçados
        a = rng.uniform(0, math.tau)
        r = rng.uniform(0.02, 0.09)
        clumps.append(("BALL", (math.cos(a) * r, math.sin(a) * r * 0.9 + 0.01, z + 0.1 + rng.uniform(-0.01, 0.025)), rng.uniform(0.035, 0.05), (1, 1, 1), False))
    hairs.append(metaball_object("Hair_Curto", hair_cap(clumps), M["Hair"]))

    curls = []
    for _ in range(70):  # cachos: muitas bolinhas na superfície do crânio
        theta = rng.uniform(0, math.tau)
        phi = rng.uniform(0, math.radians(100))
        r = 0.135
        co = (math.sin(phi) * math.cos(theta) * r * 0.95, math.sin(phi) * math.sin(theta) * r + 0.015, z + 0.03 + math.cos(phi) * r)
        curls.append(("BALL", co, rng.uniform(0.03, 0.042), (1, 1, 1), False))
    hairs.append(metaball_object("Hair_Cacheado", hair_cap(curls), M["Hair"], resolution=0.007))

    bun = [("BALL", (0, 0.1, z + 0.12), 0.07, (1, 1, 1), False), ("ELLIPSOID", (0, 0.03, z + 0.1), 0.1, (1.0, 1.0, 0.6), False)]
    hairs.append(metaball_object("Hair_Coque", hair_cap(bun), M["Hair"]))

    long = [("ELLIPSOID", (0, 0.06, z - 0.12), 0.13, (1.05, 0.55, 1.6), False)]
    long_cap = [e for e in hair_cap(long) if not (e[4] and e[1][2] < z - 0.1)]  # sem recorte da nuca
    hairs.append(metaball_object("Hair_Longo", long_cap, M["Hair"]))
    return hairs


def build_beards():
    """Barba: uma "casca" um pouco maior que a mandíbula, recortada acima da linha das bochechas."""
    z = HEAD_Z
    E = "ELLIPSOID"
    beard = metaball_object(
        "Beard_Cheia",
        [
            (E, (0, -0.03, z - 0.065), 0.112, (0.9, 0.92, 0.85), False),  # mandíbula + 8%
            ("BALL", (0, -0.068, z - 0.1), 0.052, (1, 1, 1), False),  # queixo
            (E, (0, -0.035, z + 0.03), 0.16, (1.2, 1.2, 0.5), True),  # tudo acima das bochechas
            (E, (0, 0.06, z - 0.06), 0.13, (1.0, 0.8, 1.2), True),  # nuca
            (E, (0, -0.13, z - 0.055), 0.026, (1.5, 1.0, 0.55), True),  # boca livre
            (E, (0, -0.1, z - 0.04), 0.028, (1.7, 0.7, 0.55), False),  # bigode
        ],
        M["Hair"],
        resolution=0.005,
    )
    mustache = metaball_object(
        "Beard_Bigode",
        [(E, (0, -0.1, z - 0.038), 0.03, (1.7, 0.6, 0.55), False)],
        M["Hair"],
        resolution=0.004,
    )
    return [beard, mustache]


def build_glasses():
    z = HEAD_Z + 0.012
    parts = []
    for s in (1, -1):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.022, minor_radius=0.0025, major_segments=32, minor_segments=8, location=(s * 0.038, -0.118, z), rotation=(math.pi / 2, 0, 0))
        ring = bpy.context.active_object
        ring.data.materials.append(M["Frame"])
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.0022, depth=0.11, location=(s * 0.066, -0.065, z + 0.004), rotation=(math.pi / 2, 0, 0))
        temple = bpy.context.active_object
        temple.data.materials.append(M["Frame"])
        parts += [ring, temple]
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.0022, depth=0.03, location=(0, -0.118, z + 0.004), rotation=(0, math.pi / 2, 0))
    bridge = bpy.context.active_object
    bridge.data.materials.append(M["Frame"])
    parts.append(bridge)
    glasses = join(parts, "Glasses_Redondo")
    smooth(glasses)
    return glasses


# ---------------------------------------------------------------- roupas, tênis e mochila


def rounded_box(name, size, location, mat, bevel=0.01, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = bevel
    mod.segments = 4
    apply_modifiers(obj)
    obj.data.materials.append(mat)
    smooth(obj, 40)
    return obj


def top(name, mat, sleeves, grow):
    sk = Skeleton()
    torso_and_limbs(sk, grow=grow, arms_to=sleeves, legs_to="none", top=1.5)
    # Só tronco e braços: remove as pernas do esqueleto (pernas ficam por conta da calça).
    return sk.build(name, mat)


def trim_below(obj, z_cut):
    """Corta a malha abaixo de uma altura (barra da blusa / cintura)."""
    import bmesh

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, z_cut), plane_no=(0, 0, 1), clear_inner=True)
    bm.to_mesh(obj.data)
    bm.free()


def trim_above(obj, z_cut):
    import bmesh

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, z_cut), plane_no=(0, 0, 1), clear_outer=True)
    bm.to_mesh(obj.data)
    bm.free()


def build_tops():
    tops = []
    hoodie = top("Top_Moletom", M["Top"], "wrist", 0.024)
    # Capuz caído nas costas e a estampa </> no peito.
    hood = metaball_object("Hood", [("ELLIPSOID", (0, 0.075, 1.47), 0.12, (1.1, 0.55, 0.55), False), ("ELLIPSOID", (0, 0.04, 1.5), 0.09, (1.2, 0.7, 0.4), True)], M["Top"])
    bpy.ops.object.text_add(location=(0, -0.13, 1.29), rotation=(math.pi / 2, 0, 0))
    text = bpy.context.active_object
    text.data.body = "</>"
    text.data.size = 0.07
    text.data.align_x = "CENTER"
    text.data.extrude = 0.002
    bpy.ops.object.convert(target="MESH")
    text = bpy.context.active_object
    text.data.materials.append(M["Print"])
    tops.append(join([hoodie, hood, text], "Top_Moletom"))

    tops.append(top("Top_Camiseta", M["Top"], "short", 0.012))

    shirt = top("Top_Xadrez", M["Plaid"], "wrist", 0.016)
    box_uv(shirt, 0.25)
    tops.append(shirt)
    return tops


def build_pants():
    sk = Skeleton()
    torso_and_limbs(sk, grow=0.016, arms_to="short", legs_to="ankle", top=1.0)
    pants = sk.build("Pants", M["Pants"])
    trim_above(pants, 1.08)  # cós acima da barra da blusa: não aparece pele na cintura
    return pants


def build_shoes():
    parts = []
    for s in (1, -1):
        x = s * 0.104
        parts.append(rounded_box(f"Sole{s}", (0.098, 0.27, 0.028), (x, -0.045, 0.014), M["ShoeSole"], 0.012))
        parts.append(rounded_box(f"Upper{s}", (0.09, 0.2, 0.07), (x, -0.02, 0.06), M["Shoes"], 0.034))
        parts.append(rounded_box(f"Toe{s}", (0.086, 0.09, 0.045), (x, -0.125, 0.045), M["Shoes"], 0.022))
        parts.append(rounded_box(f"Ankle{s}", (0.085, 0.1, 0.07), (x, 0.03, 0.115), M["Shoes"], 0.03))
        parts.append(rounded_box(f"Swoosh{s}", (0.094, 0.1, 0.012), (x, 0.0, 0.065), M["ShoeAccent"], 0.005))
        for k in range(3):  # cadarço
            parts.append(rounded_box(f"Lace{s}{k}", (0.05, 0.008, 0.006), (x, -0.07 + k * 0.025, 0.105 + k * 0.004), M["ShoeSole"], 0.002))
    return join(parts, "Shoes")


def build_backpack():
    parts = [rounded_box("Bag", (0.3, 0.13, 0.4), (0, 0.17, 1.2), M["Backpack"], 0.05)]
    parts.append(rounded_box("Pocket", (0.22, 0.05, 0.16), (0, 0.24, 1.1), M["Backpack"], 0.03))
    for s in (1, -1):
        parts.append(rounded_box(f"Strap{s}", (0.045, 0.014, 0.26), (s * 0.09, -0.128, 1.32), M["Strap"], 0.006, rotation=(math.radians(-14), 0, 0)))
        parts.append(rounded_box(f"StrapTop{s}", (0.045, 0.2, 0.02), (s * 0.09, 0.02, 1.46), M["Strap"], 0.008))
    # Adesivos de dev na mochila.
    parts.append(rounded_box("Sticker1", (0.06, 0.004, 0.06), (0.07, 0.237, 1.32), M["Print"], 0.01))
    parts.append(rounded_box("Sticker2", (0.05, 0.004, 0.05), (-0.08, 0.237, 1.25), M["ShoeAccent"], 0.01))
    return join(parts, "Backpack")


# ---------------------------------------------------------------- montagem


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_materials()
    body = build_body()
    head, eyes = build_head()
    objects = [body, head, eyes, build_pants(), build_shoes(), build_backpack(), build_glasses()]
    objects += build_hairs()
    objects += build_beards()
    objects += build_tops()

    root = link(bpy.data.objects.new("Dev", None))
    for o in objects:
        o.parent = root

    bpy.context.view_layer.update()
    tris = 0
    for o in objects:
        o.data.calc_loop_triangles()
        tris += len(o.data.loop_triangles)
    top_z = max((o.matrix_world @ Vector(c)).z for o in objects if o.name in ("Head", "Hair_Curto") for c in o.bound_box)
    print(f"Altura com cabelo: {top_z:.2f} m, triângulos (todas as variações): {tris}")

    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format="GLB", export_apply=True, export_yup=True)
    print(f"OK {OUT}")


main()
