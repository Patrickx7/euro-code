"""
Converte o personagem do pacote "Animated Characters 2" do Kenney (CC0, www.kenney.nl) para o jogo.

    python tools/blender/kenney_personagem.py <pasta-do-pacote> public/models/personagem/dev.glb

A pasta do pacote é o zip extraído de https://opengameart.org/content/animated-characters-2
(Model/characterMedium.fbx, Animations/*.fbx, Skins/*.png).

Saída: um glTF com o esqueleto, a malha (material "Skin", textura trocável pelo jogo) e as
animações "Idle", "Run" e "Jump". Altura ajustada para 1,75 m, olhando para +Z no Three.js.
"""

import os
import sys

import bpy  # precisa vir antes: registra o módulo mathutils

PACK, OUT = sys.argv[-2], sys.argv[-1]
HEIGHT = 1.75
ANIMATIONS = {"idle": "Idle", "run": "Run", "jump": "Jump"}


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=os.path.join(PACK, "Model", "characterMedium.fbx"))
    rig = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
    mesh = next(o for o in bpy.context.scene.objects if o.type == "MESH")
    rig.name = "Dev"
    mesh.name = "Body"
    keep = {rig, mesh}

    # Escala: 1,75 m de altura (o pacote usa outra unidade). Vai num nó raiz para não alterar as
    # animações, que movem os ossos em unidades do pacote.
    bpy.context.view_layer.update()
    height = mesh.dimensions.z * mesh.matrix_world.to_scale().z  # medido em repouso, antes das animações
    factor = HEIGHT / height

    # Animações: cada FBX traz um esqueleto próprio, com repouso de braços para baixo, enquanto o modelo
    # repousa em T. Copiar as rotações locais daria a pose errada, então o esqueleto do modelo imita a
    # pose global de cada osso do esqueleto da animação e o resultado é gravado (bake) quadro a quadro.
    rig.animation_data_create()
    for file, name in ANIMATIONS.items():
        before_objs = set(bpy.context.scene.objects)
        before = set(bpy.data.actions)
        bpy.ops.import_scene.fbx(filepath=os.path.join(PACK, "Animations", f"{file}.fbx"))
        src = next(o for o in bpy.context.scene.objects if o not in before_objs and o.type == "ARMATURE")
        action = next(a for a in bpy.data.actions if a not in before and a.name.endswith(f"|{name}"))
        src.animation_data.action = action
        if getattr(action, "slots", None):
            src.animation_data.action_slot = action.slots[0]

        for pb in rig.pose.bones:
            if pb.name not in src.pose.bones:
                continue
            c = pb.constraints.new("COPY_TRANSFORMS")
            c.target = src
            c.subtarget = pb.name
            c.mix_mode = "REPLACE"
            c.target_space = c.owner_space = "WORLD"

        for o in bpy.context.selected_objects:
            o.select_set(False)
        bpy.context.view_layer.objects.active = rig
        rig.select_set(True)
        bpy.ops.object.mode_set(mode="POSE")
        bpy.ops.pose.select_all(action="SELECT")
        start, end = (int(x) for x in action.frame_range)
        bpy.ops.nla.bake(
            frame_start=start,
            frame_end=end,
            only_selected=True,
            visual_keying=True,
            clear_constraints=True,
            use_current_action=False,
            bake_types={"POSE"},
        )
        bpy.ops.object.mode_set(mode="OBJECT")
        baked = rig.animation_data.action
        baked.name = name
        track = rig.animation_data.nla_tracks.new()
        track.name = name
        strip = track.strips.new(name, start, baked)
        if getattr(baked, "slots", None) and hasattr(strip, "action_slot"):
            strip.action_slot = baked.slots[0]
        rig.animation_data.action = None
        for o in [o for o in bpy.context.scene.objects if o not in before_objs]:
            bpy.data.objects.remove(o, do_unlink=True)

    for obj in list(bpy.context.scene.objects):
        if obj not in keep:
            bpy.data.objects.remove(obj, do_unlink=True)
    for action in list(bpy.data.actions):
        if action.name not in ANIMATIONS.values():
            bpy.data.actions.remove(action)

    # Só agora (depois do bake, que copia a pose em espaço global) o personagem é reduzido para 1,75 m.
    root = bpy.data.objects.new("DevRoot", None)
    bpy.context.scene.collection.objects.link(root)
    root.scale = (factor, factor, factor)
    rig.parent = root

    # Material com nome fixo e a skin padrão embutida (o jogo troca a textura pela escolhida).
    mat = mesh.data.materials[0]
    mat.name = "Skin"
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Roughness"].default_value = 0.8
    # O FBX vem com transparência ligada à textura; o personagem é opaco.
    for link in list(mat.node_tree.links):
        if link.to_socket == bsdf.inputs["Alpha"]:
            mat.node_tree.links.remove(link)
    bsdf.inputs["Alpha"].default_value = 1.0
    mat.surface_render_method = "DITHERED"
    if hasattr(mat, "blend_method"):
        mat.blend_method = "OPAQUE"
    tex = next((n for n in nodes if n.type == "TEX_IMAGE"), None) or nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(os.path.join(PACK, "Skins", "skaterMaleA.png"))
    tex.image.pack()
    mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])

    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=os.path.abspath(OUT),
        export_format="GLB",
        export_yup=True,
        export_animations=True,
        export_animation_mode="NLA_TRACKS",
    )
    print(f"OK {OUT} altura={HEIGHT} fator={factor:.4f} animações={list(ANIMATIONS.values())}")


main()
