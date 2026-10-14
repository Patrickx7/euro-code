"""
Converte um carro low poly em FBX para o padrão do jogo e exporta em glTF.

    python tools/blender/importar_carro.py <entrada.fbx> <textura.png> <comprimento_m> <frente> <saida.glb> [remap]

<frente>: eixo do modelo original que aponta para a frente do carro: +Y, -Y, +X ou -X.
[remap]: opcional, troca cores da paleta em peças específicas (quando o modelo veio com outra paleta),
no formato "prefixo:u,v>u2,v2;...". Ex.: "Cilindro.00:0.2,0.92>0.94,0.94" pinta os pneus de escuro.

Padrão do jogo (o mesmo do Quadradinho): no Blender, X para a frente, Z para cima, rodas no chão (z=0),
centro do carro na origem. Câmeras e luzes do arquivo original são descartadas, e todos os materiais
recebem a textura (paleta de cores) indicada.
"""

import math
import sys

import bpy  # precisa vir antes: registra o módulo mathutils

from mathutils import Matrix, Vector  # noqa: E402

args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
SRC, TEXTURE, LENGTH, FRONT, OUT = args[0], args[1], float(args[2]), args[3], args[4]
REMAP = args[5] if len(args) > 5 else ""


def apply_remap(meshes):
    """Aplica todas as trocas numa passada, sempre a partir da UV original (trocas não se encadeiam)."""
    rules = []
    for rule in filter(None, REMAP.split(";")):
        prefix, change = rule.split(":")
        old, new = ([float(x) for x in part.split(",")] for part in change.split(">"))
        rules.append((prefix, old, new))
    for obj in meshes:
        if not obj.data.uv_layers:
            continue
        mine = [(old, new) for prefix, old, new in rules if obj.name.startswith(prefix)]
        for loop in obj.data.uv_layers.active.data:
            for old, new in mine:
                if abs(loop.uv.x - old[0]) < 0.02 and abs(loop.uv.y - old[1]) < 0.02:
                    loop.uv = new
                    break


ROTATION_Z = {"+X": 0.0, "-X": math.pi, "+Y": -math.pi / 2, "-Y": math.pi / 2}


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=SRC)
    for obj in list(bpy.context.scene.objects):
        if obj.type != "MESH":
            # Mantém o parentesco das malhas antes de apagar vazios/câmeras/luzes.
            for child in obj.children:
                matrix = child.matrix_world.copy()
                child.parent = None
                child.matrix_world = matrix
            bpy.data.objects.remove(obj, do_unlink=True)

    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    # Uma única camada de UV com o mesmo nome em todas as peças; senão, ao juntar, as peças cuja
    # camada tem outro nome perdem as coordenadas (e pegam a cor errada da paleta).
    for obj in meshes:
        layers = obj.data.uv_layers
        if not layers:
            layers.new(name="UVMap")
        keep = layers.active
        for layer in list(layers):
            if layer != keep:
                layers.remove(layer)
        layers.active.name = "UVMap"
    apply_remap(meshes)
    image = bpy.data.images.load(TEXTURE)
    image.pack()
    for obj in meshes:
        if not obj.data.materials:
            obj.data.materials.append(bpy.data.materials.new("Paint"))
        for mat in obj.data.materials:
            mat.use_nodes = True
            nodes = mat.node_tree.nodes
            bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
            tex = next((n for n in nodes if n.type == "TEX_IMAGE"), None) or nodes.new("ShaderNodeTexImage")
            tex.image = image
            tex.interpolation = "Closest"  # paleta: sem borrar as cores vizinhas
            mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
            bsdf.inputs["Roughness"].default_value = 0.5

    # Junta tudo num objeto, aplica transformações, gira para X à frente, escala e apoia no chão.
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    car = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    car.data.transform(Matrix.Rotation(ROTATION_Z[FRONT], 4, "Z"))
    lo = Vector([min(v.co[i] for v in car.data.vertices) for i in range(3)])
    hi = Vector([max(v.co[i] for v in car.data.vertices) for i in range(3)])
    scale = LENGTH / (hi.x - lo.x)
    center = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    car.data.transform(Matrix.Scale(scale, 4) @ Matrix.Translation(-center))
    car.data.update()
    size = (hi - lo) * scale
    car.name = "Body"
    car.data.shade_smooth()
    car.data.set_sharp_from_angle(angle=math.radians(35))

    bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_yup=True)
    print(f"OK {OUT} comprimento={size.x:.2f} largura={size.y:.2f} altura={size.z:.2f}")


main()
