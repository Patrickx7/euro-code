"""
Modela o "Quadradinho 1.0" (popular quadradão inspirado no Uno, sem marcas) e exporta em glTF.

    python tools/blender/quadradinho.py public/models/carros/quadradinho.glb

Requer o Blender como módulo Python (`pip install bpy`). Convenções do modelo:
- Blender: X para a frente, Y para a esquerda, Z para cima (no glTF/Three.js: X frente, Y cima, Z direita).
- Medidas em metros, próximas de um popular dos anos 90: 3,64 m x 1,55 m x 1,44 m, entre-eixos 2,36 m.
- Objetos com nome fixo para o jogo: Body, Door_L (porta trocada), Wheel_FL/FR/RL/RR (origem no cubo da
  roda), SteeringWheel. Materiais com nome fixo: Paint (cor personalizável), Paint_Door, Glass, Trim,
  Interior, Headlight, Taillight, Indicator, Chrome, Rubber, SteelRim, Plate.
"""

import math
import os
import sys

import bpy  # precisa vir antes: registra os módulos bmesh e mathutils

import bmesh  # noqa: E402
from mathutils import Vector  # noqa: E402

OUT = sys.argv[-1] if sys.argv[-1].endswith(".glb") else "quadradinho.glb"
HERE = os.path.dirname(os.path.abspath(__file__))

SCALE = 0.95  # o modelo é desenhado um pouco maior; isto o leva às medidas de um popular compacto
AXLE_X = 1.17
WHEEL_R = 0.29
ARCH_R = 0.32
TRACK = 0.695  # metade da bitola (centro do pneu)


# ---------------------------------------------------------------- cena e materiais


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, color, metallic=0.0, roughness=0.5, coat=0.0, emission=None, strength=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if coat:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.05
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = strength
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        mat.surface_render_method = "BLENDED"
    return mat


def srgb(hex_color):
    """Cor em hexadecimal (sRGB) para o espaço linear do Blender."""
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i : i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


M = {}


def build_materials():
    M["Paint"] = material("Paint", srgb("c8c2b4"), metallic=0.0, roughness=0.38, coat=0.6)
    M["Paint_Door"] = material("Paint_Door", srgb("8f9396"), roughness=0.75)  # porta do ferro-velho
    M["Glass"] = material("Glass", srgb("1b2328"), roughness=0.03, alpha=0.42)
    M["Trim"] = material("Trim", srgb("1c1d1f"), roughness=0.7)
    M["Interior"] = material("Interior", srgb("3b3c3f"), roughness=0.85)
    M["InteriorLight"] = material("InteriorLight", srgb("9a958c"), roughness=0.9)
    M["Seat"] = material("Seat", srgb("6f6b66"), roughness=0.95)
    M["Gauges"] = gauges_material()
    M["Headlight"] = material("Headlight", srgb("e8eef2"), metallic=0.2, roughness=0.08, emission=srgb("fff4dc"), strength=0.0)
    M["Taillight"] = material("Taillight", srgb("a3121a"), roughness=0.15, emission=srgb("ff2a1a"), strength=0.0)
    M["Indicator"] = material("Indicator", srgb("e08a1c"), roughness=0.15, emission=srgb("ffa030"), strength=0.0)
    M["Lens"] = material("Lens", srgb("dfe8ee"), roughness=0.02, alpha=0.25)
    M["Chrome"] = material("Chrome", srgb("d6d8da"), metallic=1.0, roughness=0.12)
    M["Rubber"] = material("Rubber", srgb("161616"), roughness=0.92)
    M["SteelRim"] = material("SteelRim", srgb("d4d6d8"), metallic=0.55, roughness=0.3)
    M["Plate"] = plate_material()


def plate_material():
    """Placa no padrão Mercosul, com texto fictício, gerada pelo Pillow."""
    from PIL import Image, ImageDraw, ImageFont

    w, h = 520, 160
    img = Image.new("RGB", (w, h), (244, 244, 240))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, 38], fill=(28, 64, 150))
    d.rectangle([3, 3, w - 4, h - 4], outline=(20, 20, 20), width=6)
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
    ]
    big = small = None
    for path in font_paths:
        if os.path.exists(path):
            big = ImageFont.truetype(path, 86)
            small = ImageFont.truetype(path, 24)
            break
    big = big or ImageFont.load_default()
    small = small or ImageFont.load_default()
    d.text((w / 2, 20), "BRASIL", fill=(255, 255, 255), font=small, anchor="mm")
    d.text((w / 2, 100), "QDR1A00", fill=(15, 15, 15), font=big, anchor="mm")
    path = os.path.join(bpy.app.tempdir or "/tmp", "placa_quadradinho.png")
    img.save(path)

    mat = bpy.data.materials.new("Plate")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.4
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    tex.image.pack()
    mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def new_object(name, mesh, mats):
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    for m in mats:
        obj.data.materials.append(m)
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


def smooth(obj, angle=35):
    obj.data.shade_smooth()
    obj.data.set_sharp_from_angle(angle=math.radians(angle))


# ---------------------------------------------------------------- carroceria (seções + subdivisão)

# Cada seção: x, z_baixo, z_cintura, z_topo_janela, z_topo, meia_largura, largura_janela, largura_teto
# Ordem: da frente para trás.
HOOD = "hood"
SECTIONS = [
    (1.82, 0.33, 0.62, 0.65, 0.68, 0.7, 0.66, 0.62),  # bico baixo
    (1.78, 0.25, 0.67, 0.7, 0.72, 0.755, 0.71, 0.66),
    (1.55, 0.19, 0.73, 0.75, 0.77, 0.77, 0.725, 0.68),
    (1.25, 0.19, 0.8, 0.825, 0.85, 0.775, 0.73, 0.685),  # capô caindo para a frente
    (1.02, 0.19, 0.87, 0.895, 0.92, 0.775, 0.73, 0.685),  # base do para-brisa (quase sobre a roda)
    (0.62, 0.19, 0.92, 1.08, 1.13, 0.775, 0.725, 0.67),
    (0.24, 0.19, 0.93, 1.33, 1.38, 0.775, 0.72, 0.665),  # topo do para-brisa
    (-0.48, 0.19, 0.94, 1.35, 1.4, 0.775, 0.72, 0.665),  # coluna B (frente)
    (-0.58, 0.19, 0.94, 1.35, 1.4, 0.775, 0.72, 0.665),  # coluna B (trás)
    (-1.12, 0.19, 0.96, 1.35, 1.4, 0.775, 0.72, 0.665),  # fim do vidro lateral traseiro
    (-1.36, 0.19, 0.97, 1.34, 1.39, 0.77, 0.715, 0.66),
    (-1.48, 0.23, 0.97, 1.31, 1.36, 0.765, 0.71, 0.655),  # topo da tampa traseira
    (-1.62, 0.25, 0.97, 1.1, 1.14, 0.76, 0.7, 0.65),
    (-1.7, 0.28, 0.9, 0.94, 0.97, 0.755, 0.7, 0.65),  # fim do vidro traseiro
    (-1.76, 0.31, 0.84, 0.88, 0.91, 0.745, 0.69, 0.64),
    (-1.79, 0.35, 0.8, 0.83, 0.86, 0.72, 0.67, 0.62),
]
# Faixas de seções (índice da seção da frente) usadas para atribuir materiais.
WINDSHIELD = range(4, 6)  # seções 4-5 e 5-6
FRONT_GLASS = range(4, 7)  # janela da porta, entre a base do para-brisa e a coluna B
B_PILLAR = range(7, 8)
REAR_GLASS = range(8, 9)
REAR_WINDOW = range(11, 13)


def section_ring(sec):
    x, zb, zbelt, zwin, ztop, w, wwin, wroof = sec
    half = [
        (0.0, zb),
        (w - 0.07, zb),
        (w, zb + 0.09),
        (w + 0.006, (zb + zbelt) / 2),
        (w, zbelt),
        (wwin + (w - wwin) * 0.45, (zbelt + zwin) / 2),
        (wwin, zwin),
        (wroof, ztop - 0.012),
        (0.0, ztop + 0.012),
    ]
    ring = [Vector((x, y, z)) for y, z in half]
    ring += [Vector((x, -y, z)) for y, z in reversed(half[1:-1])]
    return ring  # 16 vértices


def band_of(j):
    """Faixa da face que começa no vértice j do anel (0 = fundo ... 7 = teto)."""
    return j if j < 8 else 15 - j


def level_of(j):
    """Nível do perfil do vértice j do anel (0 = centro do fundo ... 8 = centro do teto)."""
    return j if j <= 8 else 16 - j


def body_material_index(segment, band):
    """0 Paint, 1 Glass, 2 Trim (colunas pretas/molduras)."""
    if band in (4, 5):  # faixa das janelas laterais
        if segment in FRONT_GLASS:
            return 1 if segment >= 5 else 0
        if segment in B_PILLAR:
            return 2
        if segment in REAR_GLASS:
            return 1
        return 0
    if band == 7:  # teto, para-brisa e vidro traseiro
        if segment in WINDSHIELD or segment in REAR_WINDOW:
            return 1
    if band == 6 and (segment in WINDSHIELD or segment in REAR_WINDOW):
        return 2  # colunas A e moldura do vidro traseiro
    return 0


def build_body():
    mesh = bpy.data.meshes.new("Body")
    bm = bmesh.new()
    rings = []
    for sec in SECTIONS:
        rings.append([bm.verts.new(v) for v in section_ring(sec)])
    bm.verts.ensure_lookup_table()
    for s in range(len(rings) - 1):
        a, b = rings[s], rings[s + 1]
        for j in range(16):
            k = (j + 1) % 16
            face = bm.faces.new((a[j], a[k], b[k], b[j]))
            face.material_index = body_material_index(s, band_of(j))
    # Tampas da frente e de trás.
    front = bm.faces.new(list(reversed(rings[0])))
    rear = bm.faces.new(rings[-1])
    front.material_index = rear.material_index = 0
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    # Vincos: mantêm o jeitão quadrado depois da subdivisão.
    crease = bm.edges.layers.float.new("crease_edge")
    along = {2: 0.5, 4: 0.75, 6: 0.5, 7: 0.95}  # arestas longitudinais por nível do perfil
    across = {1: 0.8, 4: 0.85, 6: 0.55, 10: 0.7, 11: 0.95, 13: 0.8}  # arestas da seção (só na parte de cima)
    for s, ring in enumerate(rings):
        for j, v in enumerate(ring):
            lvl = level_of(j)
            if s + 1 < len(rings) and lvl in along:
                bm.edges.get((v, rings[s + 1][j]))[crease] = along[lvl]
            if s in across and level_of((j + 1) % 16) >= 5 and lvl >= 5:
                edge = bm.edges.get((v, ring[(j + 1) % 16]))
                if edge:
                    edge[crease] = across[s]
    for e in front.edges[:] + rear.edges[:]:
        e[crease] = 0.85
    bm.to_mesh(mesh)
    bm.free()

    body = new_object("Body", mesh, [M["Paint"], M["Glass"], M["Trim"]])
    sub = body.modifiers.new("Subdiv", "SUBSURF")
    sub.levels = sub.render_levels = 2
    apply_modifiers(body)
    smooth(body, 40)
    return body


def cut_wheel_arches(body):
    for x in (AXLE_X, -AXLE_X):
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=ARCH_R, depth=2.2, location=(x, 0, WHEEL_R + 0.02))
        cutter = bpy.context.active_object
        cutter.rotation_euler = (math.pi / 2, 0, 0)
        cutter.data.materials.append(M["Trim"])
        mod = body.modifiers.new("Arch", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.solver = "EXACT"
        mod.object = cutter
        mod.material_mode = "TRANSFER"
        apply_modifiers(body)
        bpy.data.objects.remove(cutter, do_unlink=True)


def build_interior_shell(body):
    """Casca interna: o que se vê de dentro pelos vidros (sem ela, o carro fica oco)."""
    shell = body.copy()
    shell.data = body.data.copy()
    shell.name = "InteriorShell"
    bpy.context.scene.collection.objects.link(shell)
    bm = bmesh.new()
    bm.from_mesh(shell.data)
    glass = [f for f in bm.faces if f.material_index == 1]
    bmesh.ops.delete(bm, geom=glass, context="FACES")
    for v in bm.verts:
        v.co -= v.normal * 0.03
    for f in bm.faces:
        f.material_index = 0
    bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(shell.data)
    bm.free()
    shell.data.materials.clear()
    shell.data.materials.append(M["InteriorLight"])  # forro do teto e colunas por dentro
    return shell


# ---------------------------------------------------------------- peças


def rounded_box(name, size, location, mat, bevel=0.02, segments=3, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = bevel
    mod.segments = segments
    mod.limit_method = "NONE"
    apply_modifiers(obj)
    obj.data.materials.append(mat)
    smooth(obj, 30)
    return obj


def bumpers_and_trim():
    parts = []
    # Para-choques pretos envolventes.
    parts.append(rounded_box("BumperFront", (0.22, 1.56, 0.27), (1.8, 0, 0.38), M["Trim"], 0.06))
    for k in range(2):
        parts.append(rounded_box(f"BumperIntake{k}", (0.02, 0.9, 0.025), (1.915, 0, 0.36 + k * 0.05), M["Interior"], 0.008, 2))
    parts.append(rounded_box("BumperRear", (0.22, 1.56, 0.27), (-1.8, 0, 0.41), M["Trim"], 0.06))
    for side in (1, -1):
        parts.append(rounded_box(f"BumperFrontCorner{side}", (0.45, 0.1, 0.25), (1.6, side * 0.73, 0.38), M["Trim"], 0.05))
        parts.append(rounded_box(f"BumperRearCorner{side}", (0.4, 0.1, 0.25), (-1.62, side * 0.73, 0.41), M["Trim"], 0.05))
        # Friso lateral de proteção, entre as rodas.
        parts.append(rounded_box(f"SideMolding{side}", (1.62, 0.03, 0.06), (0.0, side * 0.788, 0.42), M["Trim"], 0.012))
        parts.append(rounded_box(f"Sill{side}", (1.6, 0.04, 0.08), (-0.05, side * 0.77, 0.26), M["Trim"], 0.02))
        # Retrovisor.
        parts.append(rounded_box(f"Mirror{side}", (0.1, 0.16, 0.11), (0.96, side * 0.87, 0.93), M["Trim"], 0.03))
        parts.append(rounded_box(f"MirrorArm{side}", (0.07, 0.1, 0.04), (0.98, side * 0.8, 0.9), M["Trim"], 0.01))
        # Maçaneta.
        parts.append(rounded_box(f"Handle{side}", (0.13, 0.025, 0.03), (-0.36, side * 0.79, 0.86), M["Trim"], 0.01))
        # Faróis retangulares, pisca e lanternas traseiras.
        parts.append(rounded_box(f"HeadlightReflector{side}", (0.03, 0.36, 0.11), (1.805, side * 0.52, 0.6), M["Chrome"], 0.01))
        parts.append(rounded_box(f"HeadlightBulb{side}", (0.04, 0.07, 0.06), (1.82, side * 0.47, 0.6), M["Headlight"], 0.02))
        parts.append(rounded_box(f"HeadlightLens{side}", (0.03, 0.38, 0.13), (1.835, side * 0.52, 0.6), M["Lens"], 0.012))
        parts.append(rounded_box(f"HeadlightFrame{side}", (0.04, 0.41, 0.15), (1.8, side * 0.52, 0.6), M["Trim"], 0.015))
        parts.append(rounded_box(f"Indicator{side}", (0.04, 0.14, 0.05), (1.9, side * 0.6, 0.47), M["Indicator"], 0.01))
        parts.append(rounded_box(f"Taillight{side}", (0.05, 0.19, 0.2), (-1.79, side * 0.58, 0.72), M["Taillight"], 0.015))
        parts.append(rounded_box(f"TaillightAmber{side}", (0.05, 0.19, 0.06), (-1.79, side * 0.58, 0.59), M["Indicator"], 0.01))
    # Grade de frisos horizontais.
    parts.append(rounded_box("Grille", (0.04, 0.6, 0.1), (1.825, 0, 0.6), M["Trim"], 0.01))
    for k in range(3):
        parts.append(rounded_box(f"GrilleSlat{k}", (0.02, 0.58, 0.014), (1.845, 0, 0.575 + k * 0.025), M["Chrome"], 0.006, 2))
    # Emblema genérico, sem marca.
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.035, depth=0.015, location=(1.85, 0, 0.6), rotation=(0, math.pi / 2, 0))
    emblem = bpy.context.active_object
    emblem.name = "Emblem"
    emblem.data.materials.append(M["Chrome"])
    parts.append(emblem)
    # Placas.
    for name, x, z, rot in (("PlateFront", 1.916, 0.42, math.pi / 2), ("PlateRear", -1.805, 0.66, -math.pi / 2)):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x, 0, z), rotation=(math.pi / 2, 0, rot))
        plate = bpy.context.active_object
        plate.name = name
        plate.scale = (0.4, 0.13, 1)
        bpy.ops.object.transform_apply(scale=True)
        plate.data.materials.append(M["Plate"])
        parts.append(plate)
    # Limpadores.
    for k, y in enumerate((0.28, -0.12)):
        parts.append(rounded_box(f"Wiper{k}", (0.02, 0.42, 0.012), (1.0, y, 0.875), M["Trim"], 0.004, 1, rotation=(0, -0.55, 0.08)))
    parts.append(rounded_box("WiperRear", (0.012, 0.36, 0.012), (-1.66, 0.05, 1.0), M["Trim"], 0.004, 1, rotation=(0, 0.2, 0.3)))
    return parts


def door_with_other_color():
    """A porta esquerda veio do ferro-velho: mesma forma da lataria, outra cor."""
    parts = []
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.235, 0.785, 0.585))
    door = bpy.context.active_object
    door.name = "Door_L"
    door.scale = (1.4, 0.012, 0.62)
    bpy.ops.object.transform_apply(scale=True)
    mod = door.modifiers.new("Bevel", "BEVEL")
    mod.width = 0.03
    mod.segments = 3
    apply_modifiers(door)
    door.data.materials.append(M["Paint_Door"])
    smooth(door, 30)
    parts.append(door)
    # Frestas das portas (dos dois lados).
    for side in (1, -1):
        for x in (0.95, -0.48):
            parts.append(rounded_box(f"DoorGap{side}{x}", (0.008, 0.012, 0.68), (x, side * 0.79, 0.6), M["Trim"], 0.002, 1))
        parts.append(rounded_box(f"DoorGapBottom{side}", (1.43, 0.012, 0.008), (0.235, side * 0.79, 0.27), M["Trim"], 0.002, 1))
    return parts


def wheel(name, x, y):
    parts = []
    # Pneu 155/80 R13: torno com flanco arredondado.
    bpy.ops.mesh.primitive_torus_add(major_radius=0.205, minor_radius=0.085, major_segments=48, minor_segments=16, location=(0, 0, 0))
    tire = bpy.context.active_object
    tire.scale = (1, 1, 0.9)
    bpy.ops.object.transform_apply(scale=True)
    tire.data.materials.append(M["Rubber"])
    smooth(tire, 60)
    outer = 1 if y > 0 else -1
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.165, depth=0.09, location=(0, 0, -outer * 0.01))
    rim = bpy.context.active_object
    rim.data.materials.append(M["SteelRim"])
    smooth(rim, 30)
    # Aba da roda: anel na borda externa, que dá profundidade ao miolo.
    bpy.ops.mesh.primitive_torus_add(major_radius=0.162, minor_radius=0.014, major_segments=48, minor_segments=8, location=(0, 0, outer * 0.05))
    lip = bpy.context.active_object
    lip.data.materials.append(M["SteelRim"])
    smooth(lip, 60)
    # Calota central e furos da roda de aço.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.065, location=(0, 0, outer * 0.035))
    cap = bpy.context.active_object
    cap.scale = (1, 1, 0.35)
    bpy.ops.object.transform_apply(scale=True)
    cap.data.materials.append(M["Chrome"])
    smooth(cap, 60)
    holes = []
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 4
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.024, depth=0.01, location=(math.cos(a) * 0.112, math.sin(a) * 0.112, outer * 0.036))
        hole = bpy.context.active_object
        hole.data.materials.append(M["Trim"])
        holes.append(hole)
    for o in [tire, rim, lip, cap, *holes]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = tire
    bpy.ops.object.join()
    w = bpy.context.active_object
    w.name = name
    # Eixo da roda (Z do torus) apontando para o lado (Y do carro).
    w.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    w.location = (x, y, WHEEL_R)
    parts.append(w)
    return parts


def gauges_material():
    """Painel de instrumentos (velocímetro, conta-giros, combustível) desenhado com Pillow."""
    from PIL import Image, ImageDraw, ImageFont

    w, h = 640, 220
    img = Image.new("RGB", (w, h), (14, 15, 17))
    d = ImageDraw.Draw(img)
    font = None
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",):
        if os.path.exists(path):
            font = ImageFont.truetype(path, 15)
    font = font or ImageFont.load_default()

    def dial(cx, cy, r, top, step, label, needle):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(26, 28, 31), outline=(90, 92, 96), width=3)
        start, end = math.radians(225), math.radians(-45)
        for k in range(0, top + 1, step):
            t = k / top
            a = start + (end - start) * t
            x1, y1 = cx + math.cos(a) * (r - 6), cy - math.sin(a) * (r - 6)
            x2, y2 = cx + math.cos(a) * (r - 18), cy - math.sin(a) * (r - 18)
            d.line([x1, y1, x2, y2], fill=(235, 235, 230), width=3)
            tx, ty = cx + math.cos(a) * (r - 34), cy - math.sin(a) * (r - 34)
            d.text((tx, ty), str(k), fill=(220, 220, 215), font=font, anchor="mm")
        d.text((cx, cy + r * 0.45), label, fill=(160, 160, 160), font=font, anchor="mm")
        a = start + (end - start) * needle
        d.line([cx, cy, cx + math.cos(a) * (r - 16), cy - math.sin(a) * (r - 16)], fill=(230, 40, 30), width=5)
        d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=(40, 40, 40))

    dial(200, 112, 98, 180, 20, "km/h", 0.33)
    dial(450, 112, 82, 7, 1, "x1000 rpm", 0.3)
    d.rectangle([560, 60, 620, 160], outline=(90, 92, 96), width=2)
    d.text((590, 75), "F", fill=(220, 220, 215), font=font, anchor="mm")
    d.text((590, 145), "E", fill=(230, 60, 40), font=font, anchor="mm")
    d.rectangle([575, 130, 605, 136], fill=(230, 60, 40))  # quase na reserva, claro
    path = os.path.join(bpy.app.tempdir or "/tmp", "painel_quadradinho.png")
    img.save(path)

    mat = bpy.data.materials.new("Gauges")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.3
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    tex.image.pack()
    mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 0.6
    return mat


def cylinder_x(name, radius, depth, location, mat, vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=(0, math.pi / 2, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    smooth(obj, 40)
    return obj


def steering_wheel():
    """Volante de quatro raios com miolo; origem no centro, para girar no jogo."""
    pieces = []
    bpy.ops.mesh.primitive_torus_add(major_radius=0.185, minor_radius=0.019, major_segments=48, minor_segments=10, location=(0, 0, 0), rotation=(0, math.pi / 2, 0))
    pieces.append(bpy.context.active_object)
    pieces[-1].data.materials.append(M["Trim"])
    for angle in (10, 170, 235, 305):
        a = math.radians(angle)
        spoke = rounded_box("Spoke", (0.022, 0.15, 0.035), (0, math.cos(a) * 0.095, math.sin(a) * 0.095), M["Trim"], 0.01, 2, rotation=(a, 0, 0))
        pieces.append(spoke)
    pieces.append(rounded_box("Hub", (0.06, 0.15, 0.12), (-0.015, 0, -0.005), M["Trim"], 0.035))
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.02, depth=0.01, location=(-0.048, 0, 0.0), rotation=(0, math.pi / 2, 0))
    pieces.append(bpy.context.active_object)
    pieces[-1].data.materials.append(M["Chrome"])
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in pieces:
        o.select_set(True)
    bpy.context.view_layer.objects.active = pieces[0]
    bpy.ops.object.join()
    wheel_obj = bpy.context.active_object
    wheel_obj.name = "SteeringWheel"
    # O objeto herdou a rotação do torus: aplica antes de inclinar, senão o volante fica deitado.
    bpy.ops.object.transform_apply(rotation=True)
    smooth(wheel_obj, 50)
    wheel_obj.rotation_euler = (0, math.radians(24), 0)  # topo inclinado para o painel
    wheel_obj.location = (0.56, 0.36, 0.87)
    return wheel_obj


def interior():
    parts = []
    inner = M["Interior"]
    light = M["InteriorLight"]
    # Painel: corpo principal, face voltada ao motorista e "capelinha" dos instrumentos.
    parts.append(rounded_box("Dashboard", (0.36, 1.42, 0.16), (0.92, 0, 0.79), inner, 0.05))
    parts.append(rounded_box("DashFace", (0.1, 1.38, 0.15), (0.76, 0, 0.71), inner, 0.03))
    # Parede corta-fogo e assoalho do pé: fecham o vão embaixo do painel.
    parts.append(rounded_box("Firewall", (0.08, 1.42, 0.5), (0.82, 0, 0.45), inner, 0.02))
    parts.append(rounded_box("Footwell", (0.5, 1.42, 0.05), (0.62, 0, 0.25), inner, 0.02, rotation=(0, math.radians(-12), 0)))
    parts.append(rounded_box("Binnacle", (0.22, 0.46, 0.13), (0.75, 0.36, 0.91), inner, 0.04))
    # Placa virada para o motorista: U da imagem para a direita dele (-Y), V para cima (+Z).
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0.638, 0.36, 0.895), rotation=(math.pi / 2, 0, -math.pi / 2))
    cluster = bpy.context.active_object
    cluster.name = "Cluster"
    cluster.scale = (0.37, 0.12, 1)
    bpy.ops.object.transform_apply(scale=True)
    cluster.data.materials.append(M["Gauges"])
    parts.append(cluster)
    # Console central com saídas de ar, rádio e botões.
    parts.append(rounded_box("CenterStack", (0.14, 0.32, 0.3), (0.74, 0, 0.6), inner, 0.03))
    for y in (0.075, -0.075):
        parts.append(rounded_box(f"VentC{y}", (0.02, 0.12, 0.07), (0.668, y, 0.71), M["Trim"], 0.01))
        for k in range(3):
            parts.append(rounded_box(f"VentSlat{y}{k}", (0.012, 0.11, 0.008), (0.66, y, 0.69 + k * 0.02), inner, 0.003, 1))
    parts.append(rounded_box("Radio", (0.02, 0.19, 0.05), (0.668, 0, 0.62), M["Trim"], 0.008))
    parts.append(rounded_box("RadioDisplay", (0.01, 0.08, 0.018), (0.657, 0.04, 0.625), M["Indicator"], 0.003, 1))
    for y in (-0.08, 0.0, 0.08):
        parts.append(cylinder_x(f"Knob{y}", 0.022, 0.03, (0.66, y, 0.54), M["Trim"]))
    # Difusores nas pontas e porta-luvas.
    for side in (1, -1):
        parts.append(rounded_box(f"VentSide{side}", (0.03, 0.09, 0.065), (0.77, side * 0.62, 0.83), M["Trim"], 0.012))
    parts.append(rounded_box("Glovebox", (0.02, 0.42, 0.11), (0.715, -0.36, 0.72), inner, 0.02))
    # Forro das portas (claro), descanso de braço, puxador e manivela do vidro.
    for side in (1, -1):
        parts.append(rounded_box(f"DoorCard{side}", (1.25, 0.03, 0.46), (0.28, side * 0.735, 0.62), light, 0.02))
        parts.append(rounded_box(f"Armrest{side}", (0.42, 0.07, 0.05), (0.15, side * 0.7, 0.66), inner, 0.02))
        parts.append(rounded_box(f"DoorPull{side}", (0.12, 0.03, 0.03), (0.5, side * 0.715, 0.79), M["Chrome"], 0.01))
        parts.append(cylinder_x(f"Crank{side}", 0.03, 0.02, (0.05, side * 0.71, 0.5), M["Trim"]))
    # Volante e coluna de direção.
    parts.append(steering_wheel())
    parts.append(rounded_box("SteeringColumn", (0.26, 0.06, 0.06), (0.68, 0.36, 0.83), inner, 0.02, rotation=(0, math.radians(-24), 0)))
    # Console baixo, câmbio e freio de mão.
    parts.append(rounded_box("Console", (0.55, 0.18, 0.14), (0.38, 0, 0.36), inner, 0.04))
    parts.append(rounded_box("GearLever", (0.02, 0.02, 0.2), (0.46, 0, 0.5), M["Trim"], 0.008, rotation=(0, math.radians(-12), 0)))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=0.032, location=(0.44, 0, 0.61))
    knob = bpy.context.active_object
    knob.name = "GearKnob"
    knob.data.materials.append(M["Trim"])
    smooth(knob, 60)
    parts.append(knob)
    parts.append(rounded_box("Handbrake", (0.24, 0.035, 0.045), (0.08, 0, 0.45), M["Trim"], 0.015, rotation=(0, math.radians(-15), 0)))
    # Bancos dianteiros (com abas laterais) e banco traseiro inteiriço.
    for y in (0.36, -0.36):
        parts.append(rounded_box(f"SeatBase{y}", (0.48, 0.46, 0.13), (0.0, y, 0.40), M["Seat"], 0.06))
        parts.append(rounded_box(f"SeatBack{y}", (0.12, 0.46, 0.58), (-0.28, y, 0.72), M["Seat"], 0.06, rotation=(0, math.radians(-12), 0)))
        for side in (1, -1):
            parts.append(rounded_box(f"SeatBolster{y}{side}", (0.13, 0.07, 0.5), (-0.24, y + side * 0.2, 0.72), M["Seat"], 0.035, rotation=(0, math.radians(-12), 0)))
        parts.append(rounded_box(f"Headrest{y}", (0.08, 0.26, 0.16), (-0.36, y, 1.1), M["Seat"], 0.04, rotation=(0, math.radians(-12), 0)))
    parts.append(rounded_box("RearSeat", (0.46, 1.3, 0.14), (-0.95, 0, 0.40), M["Seat"], 0.06))
    parts.append(rounded_box("RearSeatBack", (0.12, 1.3, 0.5), (-1.22, 0, 0.68), M["Seat"], 0.06, rotation=(0, math.radians(-10), 0)))
    parts.append(rounded_box("Floor", (3.2, 1.45, 0.04), (0, 0, 0.24), inner, 0.01))
    return parts


# ---------------------------------------------------------------- montagem e exportação


def main():
    reset_scene()
    build_materials()
    body = build_body()
    cut_wheel_arches(body)
    shell = build_interior_shell(body)
    parts = [body, shell]
    parts += bumpers_and_trim()
    parts += door_with_other_color()
    parts += interior()
    wheels = []
    for name, x, y in (("Wheel_FL", AXLE_X, TRACK), ("Wheel_FR", AXLE_X, -TRACK), ("Wheel_RL", -AXLE_X, TRACK), ("Wheel_RR", -AXLE_X, -TRACK)):
        wheels += wheel(name, x, y)

    # Junta as peças estáticas num objeto só (menos draw calls no jogo); rodas e volante ficam separados.
    keep_separate = {"Body", "Door_L", "SteeringWheel"}
    static = [o for o in parts if o.name not in keep_separate and o.name != "InteriorShell"]
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in static + [shell]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = shell
    bpy.ops.object.join()
    bpy.context.active_object.name = "Details"

    root = bpy.data.objects.new("Quadradinho", None)
    root.scale = (SCALE, SCALE, SCALE)
    bpy.context.scene.collection.objects.link(root)
    for o in list(bpy.context.scene.objects):
        if o is not root and o.parent is None:
            o.parent = root

    bpy.context.view_layer.update()
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for o in bpy.context.scene.objects:
        if o.type != "MESH":
            continue
        for corner in o.bound_box:
            p = o.matrix_world @ Vector(corner)
            lo = Vector(map(min, lo, p))
            hi = Vector(map(max, hi, p))
    size = hi - lo
    print(f"Medidas: comprimento {size.x:.2f} m, largura {size.y:.2f} m (com retrovisores), altura {size.z:.2f} m")
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.abspath(OUT),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
    )
    tris = sum(len(o.data.loop_triangles) if o.type == "MESH" and not o.data.calc_loop_triangles() else len(o.data.loop_triangles) for o in bpy.context.scene.objects if o.type == "MESH")
    print(f"OK {OUT} objetos={len([o for o in bpy.context.scene.objects if o.type == 'MESH'])} triângulos={tris}")


main()
