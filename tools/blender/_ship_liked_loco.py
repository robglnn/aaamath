import bpy, os
OUT = r"C:\dev\aaamath\public\models"
RAW = r"C:\dev\aaamath\tools\meshy_raw"
TARGET_H = 1.55
TEX_MAX = 1024
pairs = [
    ("riser-player-liked-walk-meshy.glb", "riser-player-walk.glb"),
    ("riser-player-liked-run-meshy.glb", "riser-player-run.glb"),
    ("riser-player-liked-jump-meshy.glb", "riser-player-jump.glb"),
    ("riser-player-liked-crawl-meshy.glb", "riser-player-crawl.glb"),
    ("riser-player-liked-rigged-meshy.glb", "riser-player.glb"),
]
from mathutils import Vector

def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.armatures, bpy.data.actions):
        for b in list(block):
            block.remove(b)

def bbox():
    mins=[1e9]*3; maxs=[-1e9]*3
    for o in bpy.data.objects:
        if o.type!="MESH": continue
        n=(o.name or "").lower()
        if "ico" in n: continue
        for c in o.bound_box:
            w=o.matrix_world@Vector(c)
            for i in range(3):
                mins[i]=min(mins[i],w[i]); maxs[i]=max(maxs[i],w[i])
    return mins,maxs

for inp, outn in pairs:
    clear()
    bpy.ops.import_scene.gltf(filepath=os.path.join(RAW, inp))
    # Clear bone custom shapes (Meshy uses Icosphere display shapes that re-export)
    for obj in bpy.data.objects:
        if obj.type!="ARMATURE": continue
        for bone in obj.pose.bones:
            bone.custom_shape = None
        for bone in obj.data.bones:
            if hasattr(bone, "custom_shape"):
                try: bone.custom_shape = None
                except Exception: pass
    # Delete helper meshes
    for obj in list(bpy.data.objects):
        n=(obj.name or "").lower()
        if obj.type=="MESH" and ("ico" in n or ("sphere" in n and len(obj.data.vertices)<200)):
            bpy.data.objects.remove(obj, do_unlink=True)
    for m in list(bpy.data.meshes):
        if "ico" in m.name.lower():
            bpy.data.meshes.remove(m)
    # Scale
    mins,maxs=bbox()
    h=max(1e-6, maxs[2]-mins[2]); s=TARGET_H/h
    roots=[o for o in bpy.data.objects if o.parent is None]
    for r in roots:
        r.scale=(r.scale[0]*s,r.scale[1]*s,r.scale[2]*s)
    bpy.context.view_layer.update()
    mins,maxs=bbox()
    cx=(mins[0]+maxs[0])*0.5; cy=(mins[1]+maxs[1])*0.5
    for r in roots:
        r.location.x-=cx; r.location.y-=cy; r.location.z-=mins[2]
    bpy.context.view_layer.update()
    for img in bpy.data.images:
        if img.size[0]<=0: continue
        w,h=img.size
        if max(w,h)<=TEX_MAX: continue
        sc=TEX_MAX/float(max(w,h))
        img.scale(max(1,int(w*sc)), max(1,int(h*sc)))
    out=os.path.join(OUT, outn)
    # Select only armature + skinned char for export
    bpy.ops.object.select_all(action="DESELECT")
    for o in bpy.data.objects:
        n=(o.name or "").lower()
        if o.type=="ARMATURE" or (o.type=="MESH" and "ico" not in n and "sphere" not in n):
            o.select_set(True)
        elif o.type=="MESH":
            o.hide_render=True
            o.hide_viewport=True
    bpy.ops.export_scene.gltf(
        filepath=out,
        use_selection=True,
        export_format="GLB",
        export_animations=True,
        export_skins=True,
        export_morph=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_yup=True,
    )
    # verify
    clear()
    bpy.ops.import_scene.gltf(filepath=out)
    objs=[(o.name,o.type,len(o.data.vertices) if o.type=="MESH" else 0) for o in bpy.data.objects]
    print(f"SHIPPED {outn} size={os.path.getsize(out)} objs={objs}")
print("DONE")
