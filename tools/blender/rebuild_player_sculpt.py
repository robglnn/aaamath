"""Loops 16–26: Fortnite-class sculpted Riser player (soft silhouette + ORM + piping).

Upgrades organic primitives toward AAA shoulder-cam read:
  16 Soft body volumes (higher subdiv, joint overlaps)
  17 Authored ORM (roughness/metallic) + cyan tech-suit piping
  18 Stylized face (eyes/brows) — no box helm
  19 Hair cards (thin ribbons) + volume clump
  20 Contoured armor plates hugging the body
  26 Single-mesh silhouette: voxel-fused torso + hips (kills stacked-sphere
    crease rings), athletic proportions (narrower waist / broader chest),
    bigger pauldrons with rim skirts, faceted glowing chest gem, and a short
    flared cape card sweeping behind the pack

Run:
  blender --background --python tools/blender/rebuild_player_sculpt.py
"""
from __future__ import annotations

import math
import os
import struct
import zlib

import bpy
import bmesh
from mathutils import Vector

OUT_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "models")
)
TEX_DIR = os.path.join(OUT_DIR, "_tex")


def clear_player() -> None:
    victims = [
        o
        for o in list(bpy.data.objects)
        if o.name.startswith(("Player_", "AR_Player", "BakeCam", "Bake_"))
    ]
    for o in victims:
        bpy.data.objects.remove(o, do_unlink=True)
    for img in list(bpy.data.images):
        if img.name.startswith("AR_Bake_") or img.name.startswith("AR_Panel") or img.name.startswith("AR_ORM"):
            bpy.data.images.remove(img)
    for m in list(bpy.data.materials):
        if m.name.startswith("AR_"):
            bpy.data.materials.remove(m)


def mat(
    name: str,
    base: tuple[float, float, float],
    metallic: float = 0.2,
    roughness: float = 0.45,
    emit: tuple[float, float, float] = (0.0, 0.0, 0.0),
    emit_str: float = 0.0,
) -> bpy.types.Material:
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emit_str
    elif "Emission" in bsdf.inputs:
        bsdf.inputs["Emission"].default_value = (*emit, 1.0)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emit_str
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def apply_mods(obj: bpy.types.Object, bevel_w: float = 0.0, subdiv: int = 0) -> None:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    if bevel_w > 0:
        bev = obj.modifiers.new("Bevel", "BEVEL")
        bev.width = bevel_w
        bev.segments = 2
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(40)
    if subdiv > 0:
        sub = obj.modifiers.new("Subsurf", "SUBSURF")
        sub.levels = subdiv
        sub.render_levels = subdiv
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except Exception:
            pass
    obj.select_set(False)


def smooth_shade(obj: bpy.types.Object) -> None:
    for poly in obj.data.polygons:
        poly.use_smooth = True


def mk_sphere(
    name: str,
    r: float,
    loc: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    segs: int = 24,
    subdiv: int = 1,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segs, ring_count=max(10, segs // 2), radius=r, location=loc
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.parent = parent
    obj.data.materials.clear()
    obj.data.materials.append(material)
    if subdiv > 0:
        apply_mods(obj, bevel_w=0.0, subdiv=subdiv)
    smooth_shade(obj)
    return obj


def mk_capsule(
    name: str,
    r: float,
    depth: float,
    loc: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    scale: tuple[float, float, float] = (1.0, 1.0, 1.0),
    rot: tuple[float, float, float] = (0.0, 0.0, 0.0),
    segs: int = 18,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rot
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for sign, z_off in ((1, depth / 2), (-1, -depth / 2)):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=segs, ring_count=segs // 2, radius=r, location=(loc[0], loc[1], loc[2] + z_off)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_Cap{sign}"
        bm = bmesh.new()
        bm.from_mesh(cap.data)
        bm.verts.ensure_lookup_table()
        kill = [v for v in bm.verts if (v.co.z * sign) < -0.001]
        bmesh.ops.delete(bm, geom=kill, context="VERTS")
        bm.to_mesh(cap.data)
        bm.free()
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        cap.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.join()
        obj = bpy.context.active_object
        obj.name = name
    obj.parent = parent
    obj.data.materials.clear()
    obj.data.materials.append(material)
    apply_mods(obj, bevel_w=0.005, subdiv=1)
    smooth_shade(obj)
    return obj


def mk_plate_sphere(
    name: str,
    r: float,
    loc: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
    segs: int = 16,
) -> bpy.types.Object:
    """Contoured armor — flattened sphere hugging the body (loop 20)."""
    return mk_sphere(name, r, loc, scale, material, parent, segs=segs, subdiv=1)


def mk_pipe(
    name: str,
    r: float,
    depth: float,
    loc: tuple[float, float, float],
    rot: tuple[float, float, float],
    material: bpy.types.Material,
    parent: bpy.types.Object,
) -> bpy.types.Object:
    """Cyan tech-suit piping (loop 17)."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=r, depth=depth, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rot
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    obj.parent = parent
    obj.data.materials.clear()
    obj.data.materials.append(material)
    apply_mods(obj, bevel_w=0.002, subdiv=0)
    smooth_shade(obj)
    return obj


def mk_hair_cards(
    parent: bpy.types.Object,
    material: bpy.types.Material,
    helm_z: float = 1.42,
) -> None:
    """Thin ribbon hair cards + organic spikes (loop 19)."""
    # Soft volume base
    mk_sphere(
        "Player_Hair_Volume",
        0.13,
        (0, -0.04, helm_z + 0.04),
        (1.2, 0.95, 0.75),
        material,
        parent,
        16,
        1,
    )
    # Flat ribbon cards (read as Fortnite hair sheets from shoulder cam)
    cards = [
        # name, sx, sy, sz, loc, rot
        ("Player_HairCard_C", 0.14, 0.02, 0.22, (0.0, 0.02, helm_z + 0.18), (0.35, 0.0, 0.0)),
        ("Player_HairCard_L", 0.1, 0.018, 0.2, (-0.09, 0.0, helm_z + 0.14), (0.4, 0.35, -0.4)),
        ("Player_HairCard_R", 0.1, 0.018, 0.2, (0.09, 0.0, helm_z + 0.14), (0.4, -0.35, 0.4)),
        ("Player_HairCard_Back", 0.16, 0.02, 0.18, (0.0, -0.14, helm_z + 0.08), (-0.55, 0.0, 0.0)),
        ("Player_HairCard_Fore", 0.09, 0.015, 0.14, (0.02, 0.12, helm_z + 0.02), (1.05, 0.1, 0.1)),
        ("Player_HairCard_SideL", 0.07, 0.014, 0.16, (-0.13, -0.04, helm_z + 0.06), (0.2, 0.6, -0.5)),
        ("Player_HairCard_SideR", 0.07, 0.014, 0.16, (0.13, -0.04, helm_z + 0.06), (0.2, -0.6, 0.5)),
    ]
    for name, sx, sy, sz, loc, rot in cards:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = (sx, sy, sz)
        obj.rotation_euler = rot
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        obj.parent = parent
        obj.data.materials.clear()
        obj.data.materials.append(material)
        apply_mods(obj, bevel_w=0.006, subdiv=1)
        smooth_shade(obj)
    # Spiky accents on top of cards
    spikes = [
        ("Player_Hair_Spiky1", 0.032, 0.2, (-0.04, 0.04, helm_z + 0.22), (0.15, 0.2, -0.15), (0.7, 0.5, 1.2)),
        ("Player_Hair_Spiky2", 0.03, 0.18, (0.05, 0.03, helm_z + 0.21), (0.2, -0.2, 0.15), (0.65, 0.48, 1.15)),
        ("Player_Hair_Spiky3", 0.028, 0.16, (-0.08, 0.0, helm_z + 0.18), (0.25, 0.3, -0.35), (0.6, 0.45, 1.1)),
        ("Player_Hair_Spiky4", 0.026, 0.15, (0.09, 0.02, helm_z + 0.17), (0.3, -0.25, 0.3), (0.55, 0.42, 1.05)),
    ]
    for name, r, depth, loc, rot, scale in spikes:
        bpy.ops.mesh.primitive_cone_add(
            vertices=9, radius1=r, radius2=0.005, depth=depth, location=loc
        )
        obj = bpy.context.active_object
        obj.name = name
        obj.rotation_euler = rot
        obj.scale = scale
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        obj.parent = parent
        obj.data.materials.clear()
        obj.data.materials.append(material)
        apply_mods(obj, bevel_w=0.003, subdiv=1)
        smooth_shade(obj)


def fuse_objects(
    name: str,
    objs: list[bpy.types.Object],
    material: bpy.types.Material,
    voxel: float,
) -> bpy.types.Object:
    """Loop 26: join overlapping soft volumes, then voxel-remesh into one
    continuous sculpt mesh so the silhouette loses the stacked-sphere creases."""
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    fused = bpy.context.active_object
    fused.name = name
    if voxel > 0:
        try:
            fused.data.remesh_voxel_size = voxel
            bpy.ops.object.voxel_remesh()
        except Exception as exc:
            print(f"VOXEL_REMESH_FAILED {name}: {exc}")
    fused.data.materials.clear()
    fused.data.materials.append(material)
    smooth_shade(fused)
    return fused


def mk_cape_card(parent: bpy.types.Object, material: bpy.types.Material) -> bpy.types.Object:
    """Loop 26: short flared cloak card — curved grid sweeping back over the
    pack, solidified; wound so the visible face reads from the shoulder cam."""
    cols, rows = 4, 7
    verts: list[tuple[float, float, float]] = []
    faces: list[tuple[int, int, int, int]] = []
    for r in range(rows + 1):
        v = r / rows
        half = 0.15 + 0.075 * v
        y = -0.145 - 0.19 * (v ** 1.35)
        z = 1.17 - 0.75 * v
        for c in range(cols + 1):
            u = (c / cols) * 2.0 - 1.0
            yy = y - 0.035 * math.sin(v * math.pi) * (1.0 - u * u)
            verts.append((u * half, yy, z))
    for r in range(rows):
        for c in range(cols):
            i0 = r * (cols + 1) + c
            i1 = (r + 1) * (cols + 1) + c
            faces.append((i0, i1, i1 + 1, i0 + 1))
    mesh = bpy.data.meshes.new("Player_CapeMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("Player_Cape", mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    obj.data.materials.append(material)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    sol = obj.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = 0.012
    sol.offset = 0.0
    try:
        bpy.ops.object.modifier_apply(modifier=sol.name)
    except Exception:
        pass
    obj.select_set(False)
    apply_mods(obj, bevel_w=0.004, subdiv=0)
    smooth_shade(obj)
    return obj


def write_png_rgba(path: str, w: int, h: int, pixels: bytes) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + pixels[y * w * 4 : (y + 1) * w * 4] for y in range(h))
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)


def make_panel_albedo_png(path: str, size: int = 384) -> str:
    """Navy tech-suit albedo with soft seams + sparse gold/cyan accents."""
    pixels = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            gx = (x / size) * 5.0
            gy = (y / size) * 6.0
            fx = abs(gx - int(gx) - 0.5)
            fy = abs(gy - int(gy) - 0.5)
            seam = 1.0 if (fx < 0.03 or fy < 0.028) else 0.0
            ao = 0.72 + 0.28 * min(fx / 0.45, fy / 0.45, 1.0)
            n = ((x * 374761 + y * 668265) % 97) / 97.0
            # Richer navy (Fortnite tech-suit)
            base_r = int(10 + ao * 22 + n * 5)
            base_g = int(32 + ao * 38 + n * 7)
            base_b = int(62 + ao * 48 + n * 9)
            if seam > 0.5 and ((int(gx) + int(gy)) % 5 == 0):
                base_r, base_g, base_b = 150, 118, 40
            elif seam > 0.5:
                base_r = int(base_r * 0.5)
                base_g = int(base_g * 0.5)
                base_b = int(base_b * 0.6)
            # Cyan stitch dots
            cx = abs((x / size) * 5.0 - int((x / size) * 5.0) - 0.5)
            cy = abs((y / size) * 6.0 - int((y / size) * 6.0) - 0.5)
            if cx < 0.04 and cy < 0.04 and ((int(gx) + int(gy)) % 4 == 0):
                base_r, base_g, base_b = 40, 185, 175
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes((base_r, base_g, base_b, 255))
    write_png_rgba(path, size, size, bytes(pixels))
    return path


def make_ao_png(path: str, size: int = 384) -> str:
    pixels = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            u = x / (size - 1)
            v = y / (size - 1)
            dx = u - 0.5
            dy = v - 0.5
            rad = math.sqrt(dx * dx + dy * dy) * 1.55
            crease = 0.0
            for t in (0.2, 0.4, 0.6, 0.8):
                crease = max(crease, 1.0 - min(1.0, abs(u - t) * 20))
                crease = max(crease, 1.0 - min(1.0, abs(v - t) * 20))
            ao = max(0.32, 1.0 - rad * 0.5 - crease * 0.38)
            c = int(ao * 255)
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes((c, c, c, 255))
    write_png_rgba(path, size, size, bytes(pixels))
    return path


def make_normal_png(path: str, size: int = 384) -> str:
    height = [[0.0] * size for _ in range(size)]
    for y in range(size):
        for x in range(size):
            gx = (x / size) * 7.0
            gy = (y / size) * 9.0
            fx = abs(gx - int(gx) - 0.5)
            fy = abs(gy - int(gy) - 0.5)
            h = 0.55
            if fx < 0.06 or fy < 0.05:
                h = 0.12
            elif fx < 0.11 or fy < 0.1:
                h = 0.88
            # Micro fabric weave
            weave = 0.04 * math.sin(x * 0.35) * math.sin(y * 0.4)
            height[y][x] = h + weave
    pixels = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            xl = height[y][max(0, x - 1)]
            xr = height[y][min(size - 1, x + 1)]
            yd = height[max(0, y - 1)][x]
            yu = height[min(size - 1, y + 1)][x]
            dx = (xl - xr) * 5.0
            dy = (yd - yu) * 5.0
            dz = 1.0
            inv = 1.0 / math.sqrt(dx * dx + dy * dy + dz * dz)
            nx, ny, nz = dx * inv, dy * inv, dz * inv
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes(
                (int((nx * 0.5 + 0.5) * 255), int((ny * 0.5 + 0.5) * 255), int((nz * 0.5 + 0.5) * 255), 255)
            )
    write_png_rgba(path, size, size, bytes(pixels))
    return path


def make_orm_png(path: str, size: int = 384) -> str:
    """Packed ORM: R=AO unused here as greyscale, G=roughness, B=metallic (loop 17).

    Exported as RGB where we sample G→roughness and B→metallic in the shader.
    """
    pixels = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            gx = (x / size) * 5.0
            gy = (y / size) * 6.0
            fx = abs(gx - int(gx) - 0.5)
            fy = abs(gy - int(gy) - 0.5)
            seam = 1.0 if (fx < 0.035 or fy < 0.03) else 0.0
            # Cloth: high roughness (~0.7), low metal; seams slightly glossier + more metal
            rough = 0.68 + ((x * 13 + y * 7) % 17) / 17.0 * 0.08
            metal = 0.06 + ((x * 3 + y * 11) % 13) / 13.0 * 0.04
            if seam > 0.5:
                rough = 0.38
                metal = 0.45
            ao = int(200 - seam * 60)
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes((ao, int(rough * 255), int(metal * 255), 255))
    write_png_rgba(path, size, size, bytes(pixels))
    return path


def mat_textured(
    name: str,
    base: tuple[float, float, float],
    albedo_path: str,
    ao_path: str,
    normal_path: str,
    orm_path: str,
    metallic: float,
    roughness: float,
    emit: tuple[float, float, float] = (0.0, 0.0, 0.0),
    emit_str: float = 0.0,
    mix: float = 0.55,
    use_orm: bool = True,
) -> bpy.types.Material:
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tex_coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (2.4, 3.0, 1.0)
    nt.links.new(tex_coord.outputs["UV"], mapping.inputs["Vector"])

    def load_img(path: str, non_color: bool = False):
        img = bpy.data.images.load(path)
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = img
        if non_color:
            img.colorspace_settings.name = "Non-Color"
        nt.links.new(mapping.outputs["Vector"], node.inputs["Vector"])
        return node

    albedo = load_img(albedo_path)
    ao = load_img(ao_path, non_color=True)
    normal = load_img(normal_path, non_color=True)

    mix_rgb = nt.nodes.new("ShaderNodeMix")
    mix_rgb.data_type = "RGBA"
    mix_rgb.inputs["Factor"].default_value = mix
    mix_rgb.inputs["A"].default_value = (*base, 1.0)
    nt.links.new(albedo.outputs["Color"], mix_rgb.inputs["B"])

    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 0.88
    nt.links.new(mix_rgb.outputs["Result"], mul.inputs["A"])
    nt.links.new(ao.outputs["Color"], mul.inputs["B"])
    nt.links.new(mul.outputs["Result"], bsdf.inputs["Base Color"])

    nrm = nt.nodes.new("ShaderNodeNormalMap")
    nrm.inputs["Strength"].default_value = 1.05
    nt.links.new(normal.outputs["Color"], nrm.inputs["Color"])
    nt.links.new(nrm.outputs["Normal"], bsdf.inputs["Normal"])

    if use_orm:
        orm = load_img(orm_path, non_color=True)
        sep = nt.nodes.new("ShaderNodeSeparateColor")
        nt.links.new(orm.outputs["Color"], sep.inputs["Color"])
        # G = roughness, B = metallic
        nt.links.new(sep.outputs["Green"], bsdf.inputs["Roughness"])
        nt.links.new(sep.outputs["Blue"], bsdf.inputs["Metallic"])
        # Soften armor metal via multiply with base metallic bias
        if metallic > 0.3:
            # Keep ORM but bias upward for armor
            mul_m = nt.nodes.new("ShaderNodeMath")
            mul_m.operation = "MULTIPLY"
            mul_m.inputs[1].default_value = 1.35
            nt.links.new(sep.outputs["Blue"], mul_m.inputs[0])
            nt.links.new(mul_m.outputs[0], bsdf.inputs["Metallic"])
            mul_r = nt.nodes.new("ShaderNodeMath")
            mul_r.operation = "MULTIPLY"
            mul_r.inputs[1].default_value = 0.55
            nt.links.new(sep.outputs["Green"], mul_r.inputs[0])
            nt.links.new(mul_r.outputs[0], bsdf.inputs["Roughness"])
    else:
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness

    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emit_str
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


def smart_uv(obj: bpy.types.Object) -> None:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    try:
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
    except Exception:
        bpy.ops.uv.sphere_project()
    bpy.ops.object.mode_set(mode="OBJECT")
    obj.select_set(False)


def build_materials(albedo: str, ao: str, nrm: str, orm: str):
    cloth = mat_textured(
        "AR_SuitCloth",
        (0.04, 0.11, 0.26),
        albedo,
        ao,
        nrm,
        orm,
        metallic=0.08,
        roughness=0.7,
        mix=0.32,
        use_orm=True,
    )
    armor = mat_textured(
        "AR_ArmorPlate",
        (0.09, 0.2, 0.36),
        albedo,
        ao,
        nrm,
        orm,
        metallic=0.62,
        roughness=0.28,
        mix=0.42,
        use_orm=True,
    )
    return {
        "cloth": cloth,
        "armor": armor,
        "skin": mat("AR_Skin", (0.62, 0.42, 0.32), metallic=0.0, roughness=0.52),
        "hair": mat("AR_Hair", (0.035, 0.025, 0.04), metallic=0.04, roughness=0.62),
        "dark": mat("AR_Dark", (0.02, 0.04, 0.08), metallic=0.4, roughness=0.45),
        "metal": mat("AR_Metal", (0.55, 0.58, 0.62), metallic=0.9, roughness=0.24),
        "gold": mat(
            "AR_Gold",
            (0.88, 0.7, 0.22),
            metallic=0.94,
            roughness=0.18,
            emit=(0.55, 0.35, 0.05),
            emit_str=1.0,
        ),
        "cyan": mat(
            "AR_Cyan",
            (0.12, 0.75, 0.7),
            metallic=0.12,
            roughness=0.2,
            emit=(0.18, 0.95, 0.85),
            emit_str=5.5,
        ),
        "piping": mat(
            "AR_CyanPiping",
            (0.08, 0.65, 0.6),
            metallic=0.2,
            roughness=0.18,
            emit=(0.2, 1.0, 0.9),
            emit_str=6.2,
        ),
        "amber": mat(
            "AR_Amber",
            (0.95, 0.65, 0.12),
            metallic=0.3,
            roughness=0.28,
            emit=(0.95, 0.5, 0.08),
            emit_str=3.4,
        ),
        "eye": mat(
            "AR_Eye",
            (0.08, 0.1, 0.14),
            metallic=0.15,
            roughness=0.15,
            emit=(0.15, 0.55, 0.7),
            emit_str=1.6,
        ),
        "visor": mat(
            "AR_VisorGlass",
            (0.05, 0.08, 0.12),
            metallic=0.4,
            roughness=0.12,
            emit=(0.2, 0.75, 0.7),
            emit_str=1.0,
        ),
    }


def build_sculpt_player(M) -> bpy.types.Object:
    root = bpy.data.objects.new("AR_Player", None)
    bpy.context.scene.collection.objects.link(root)

    # --- Athletic torso, fused into ONE continuous sculpt (loop 26) ---
    # Broader chest, narrower waist than loops 16–20; voxel fusion erases the
    # crease rings where the spheres used to intersect.
    torso_chest = mk_sphere("Player_Chest", 0.225, (0, -0.01, 1.03), (1.17, 0.72, 1.0), M["cloth"], root, 28, 2)
    torso_abd = mk_sphere("Player_Abdomen", 0.165, (0, -0.01, 0.75), (0.98, 0.74, 0.9), M["cloth"], root, 22, 1)
    torso_waist = mk_sphere("Player_WaistBlend", 0.14, (0, -0.01, 0.645), (0.92, 0.76, 0.55), M["cloth"], root, 16, 1)
    fuse_objects("Player_TorsoSculpt", [torso_chest, torso_abd, torso_waist], M["cloth"], 0.0125)

    # Hips: pelvis + thigh tops fused into one shorts/hips sculpt (loop 26)
    hips_pelvis = mk_sphere("Player_Pelvis", 0.155, (0, -0.01, 0.54), (1.12, 0.86, 0.72), M["dark"], root, 18, 1)
    hips_thigh_l = mk_capsule("Player_Thigh_L", 0.068, 0.28, (-0.1, -0.01, 0.38), M["dark"], root, segs=16)
    hips_thigh_r = mk_capsule("Player_Thigh_R", 0.068, 0.28, (0.1, -0.01, 0.38), M["dark"], root, segs=16)
    fuse_objects("Player_HipsSculpt", [hips_pelvis, hips_thigh_l, hips_thigh_r], M["dark"], 0.0135)

    # Contoured chest armor (loop 20) — flattened spheres, not boxes
    mk_plate_sphere("Player_ChestPlate", 0.14, (0, 0.14, 1.0), (1.15, 0.28, 1.05), M["armor"], root, 18)
    mk_plate_sphere("Player_ChestGold", 0.06, (0, 0.16, 0.9), (1.6, 0.25, 0.45), M["gold"], root, 12)
    # Loop 26: faceted glowing chest gem in a gold bezel (Fortnite hero read)
    mk_plate_sphere("Player_ChestGemBezel", 0.062, (0, 0.15, 1.04), (1.15, 0.32, 1.4), M["gold"], root, 12)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.05, location=(0, 0.162, 1.04))
    gem = bpy.context.active_object
    gem.name = "Player_ChestGem"
    gem.scale = (1.0, 0.55, 1.35)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    gem.parent = root
    gem.data.materials.clear()
    gem.data.materials.append(M["cyan"])
    smooth_shade(gem)

    # Cyan tech-suit piping (loop 17)
    mk_pipe("Player_Pipe_ChestL", 0.008, 0.32, (-0.1, 0.14, 0.98), (0.15, 0.0, 0.2), M["piping"], root)
    mk_pipe("Player_Pipe_ChestR", 0.008, 0.32, (0.1, 0.14, 0.98), (0.15, 0.0, -0.2), M["piping"], root)
    mk_pipe("Player_Pipe_SideL", 0.007, 0.28, (-0.2, 0.08, 0.88), (0.4, 0.3, 0.5), M["piping"], root)
    mk_pipe("Player_Pipe_SideR", 0.007, 0.28, (0.2, 0.08, 0.88), (0.4, -0.3, -0.5), M["piping"], root)
    mk_pipe("Player_Pipe_Belt", 0.007, 0.36, (0.0, 0.1, 0.58), (1.57, 0.0, 0.0), M["piping"], root)

    # Head + face (loop 18)
    mk_sphere("Player_Head", 0.13, (0, 0.02, 1.39), (0.95, 1.0, 1.08), M["skin"], root, 24, 1)
    mk_sphere("Player_Neck", 0.058, (0, 0.0, 1.24), (1.15, 1.0, 0.95), M["skin"], root, 14, 0)
    mk_sphere("Player_Jaw", 0.07, (0, 0.04, 1.3), (1.05, 0.85, 0.7), M["skin"], root, 12, 0)
    # Eyes
    mk_sphere("Player_Eye_L", 0.022, (-0.045, 0.115, 1.4), (1.0, 0.7, 1.0), M["eye"], root, 10, 0)
    mk_sphere("Player_Eye_R", 0.022, (0.045, 0.115, 1.4), (1.0, 0.7, 1.0), M["eye"], root, 10, 0)
    mk_sphere("Player_Pupil_L", 0.01, (-0.045, 0.13, 1.4), (1.0, 0.6, 1.0), M["dark"], root, 8, 0)
    mk_sphere("Player_Pupil_R", 0.01, (0.045, 0.13, 1.4), (1.0, 0.6, 1.0), M["dark"], root, 8, 0)
    # Brow ridges
    mk_plate_sphere("Player_Brow_L", 0.03, (-0.05, 0.11, 1.45), (1.3, 0.4, 0.5), M["dark"], root, 8)
    mk_plate_sphere("Player_Brow_R", 0.03, (0.05, 0.11, 1.45), (1.3, 0.4, 0.5), M["dark"], root, 8)
    # Slim visor band (accent only)
    mk_plate_sphere("Player_VisorBand", 0.05, (0, 0.125, 1.42), (1.7, 0.35, 0.55), M["visor"], root, 12)
    mk_plate_sphere("Player_EarPlate_L", 0.035, (-0.125, 0.0, 1.38), (0.55, 1.0, 1.15), M["armor"], root, 10)
    mk_plate_sphere("Player_EarPlate_R", 0.035, (0.125, 0.0, 1.38), (0.55, 1.0, 1.15), M["armor"], root, 10)

    mk_hair_cards(root, M["hair"], helm_z=1.42)

    # Shoulders — loop 26: bigger pauldrons + rim skirts for the hero silhouette
    mk_sphere("Player_Pauldron_L", 0.125, (-0.305, -0.005, 1.16), (1.3, 0.95, 0.8), M["armor"], root, 20, 1)
    mk_sphere("Player_Pauldron_R", 0.125, (0.305, -0.005, 1.16), (1.3, 0.95, 0.8), M["armor"], root, 20, 1)
    mk_plate_sphere("Player_PaulSkirt_L", 0.09, (-0.315, 0.0, 1.09), (1.45, 1.05, 0.42), M["armor"], root, 14)
    mk_plate_sphere("Player_PaulSkirt_R", 0.09, (0.315, 0.0, 1.09), (1.45, 1.05, 0.42), M["armor"], root, 14)
    mk_sphere("Player_PaulPip_L", 0.022, (-0.315, 0.09, 1.21), (1.0, 0.7, 1.0), M["cyan"], root, 8, 0)
    mk_sphere("Player_PaulPip_R", 0.022, (0.315, 0.09, 1.21), (1.0, 0.7, 1.0), M["cyan"], root, 8, 0)
    # Deltoid soft blend into arm
    mk_sphere("Player_Deltoid_L", 0.075, (-0.335, 0.0, 1.05), (1.1, 0.95, 0.9), M["cloth"], root, 14, 1)
    mk_sphere("Player_Deltoid_R", 0.075, (0.335, 0.0, 1.05), (1.1, 0.95, 0.9), M["cloth"], root, 14, 1)

    # Backpack
    mk_sphere("Player_Pack", 0.145, (0, -0.2, 0.98), (1.08, 0.52, 1.18), M["dark"], root, 16, 1)
    # Rear cyan piping — sells tech-suit from shoulder cam (A/B gap close)
    mk_pipe("Player_Pipe_BackL", 0.007, 0.26, (-0.08, -0.18, 0.95), (0.2, 0.15, 0.1), M["piping"], root)
    mk_pipe("Player_Pipe_BackR", 0.007, 0.26, (0.08, -0.18, 0.95), (0.2, -0.15, -0.1), M["piping"], root)
    mk_pipe("Player_Pipe_Spine", 0.008, 0.34, (0.0, -0.16, 0.88), (0.15, 0.0, 0.0), M["piping"], root)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=14, radius=0.055, depth=0.1, location=(0, -0.29, 0.98)
    )
    core = bpy.context.active_object
    core.name = "Player_PackCore"
    core.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    core.parent = root
    core.data.materials.clear()
    core.data.materials.append(M["cyan"])
    smooth_shade(core)
    mk_plate_sphere("Player_PackRail", 0.05, (0, -0.2, 1.14), (2.4, 0.35, 0.55), M["metal"], root, 10)

    # Loop 26: short flared cape sweeping behind the pack + hem trim + clasp
    mk_cape_card(root, M["cloth"])
    mk_pipe("Player_CapeTrim", 0.007, 0.44, (0.0, -0.332, 0.415), (0.0, math.radians(90), 0.0), M["piping"], root)
    mk_sphere("Player_CapeClasp", 0.028, (0.0, -0.15, 1.16), (1.2, 0.7, 0.9), M["gold"], root, 10, 0)

    # Arms
    mk_capsule("Player_Arm_L", 0.055, 0.3, (-0.37, -0.01, 0.88), M["cloth"], root, segs=16)
    mk_capsule("Player_Arm_R", 0.055, 0.3, (0.37, -0.01, 0.88), M["cloth"], root, segs=16)
    mk_sphere("Player_Elbow_L", 0.048, (-0.38, 0.0, 0.72), (1.05, 1.0, 0.95), M["cloth"], root, 12, 0)
    mk_sphere("Player_Elbow_R", 0.048, (0.38, 0.0, 0.72), (1.05, 1.0, 0.95), M["cloth"], root, 12, 0)
    mk_capsule("Player_Fore_L", 0.045, 0.25, (-0.39, 0.02, 0.56), M["cloth"], root, segs=14)
    mk_capsule("Player_Fore_R", 0.045, 0.25, (0.39, 0.02, 0.56), M["cloth"], root, segs=14)
    # Forearm piping
    mk_pipe("Player_Pipe_ArmL", 0.006, 0.18, (-0.42, 0.05, 0.58), (0.1, 0.0, 0.0), M["piping"], root)
    mk_pipe("Player_Pipe_ArmR", 0.006, 0.18, (0.42, 0.05, 0.58), (0.1, 0.0, 0.0), M["piping"], root)
    mk_sphere("Player_Gaunt_L", 0.055, (-0.39, 0.04, 0.4), (1.15, 1.0, 0.72), M["metal"], root, 12, 0)
    mk_sphere("Player_Gaunt_R", 0.055, (0.39, 0.04, 0.4), (1.15, 1.0, 0.72), M["metal"], root, 12, 0)

    # Legs — thighs live in the fused Player_HipsSculpt above (loop 26)
    mk_sphere("Player_Knee_L", 0.052, (-0.1, 0.05, 0.26), (1.2, 0.9, 0.95), M["metal"], root, 12, 0)
    mk_sphere("Player_Knee_R", 0.052, (0.1, 0.05, 0.26), (1.2, 0.9, 0.95), M["metal"], root, 12, 0)
    mk_capsule("Player_Shin_L", 0.05, 0.25, (-0.1, 0.01, 0.13), M["cloth"], root, segs=14)
    mk_capsule("Player_Shin_R", 0.05, 0.25, (0.1, 0.01, 0.13), M["cloth"], root, segs=14)
    mk_pipe("Player_Pipe_ShinL", 0.006, 0.16, (-0.13, 0.05, 0.14), (0.05, 0.0, 0.0), M["piping"], root)
    mk_pipe("Player_Pipe_ShinR", 0.006, 0.16, (0.13, 0.05, 0.14), (0.05, 0.0, 0.0), M["piping"], root)
    mk_plate_sphere("Player_Boot_L", 0.08, (-0.1, 0.06, 0.04), (1.15, 1.5, 0.55), M["dark"], root, 12)
    mk_plate_sphere("Player_Boot_R", 0.08, (0.1, 0.06, 0.04), (1.15, 1.5, 0.55), M["dark"], root, 12)

    # Belt
    mk_plate_sphere("Player_Belt", 0.1, (0, 0.02, 0.58), (1.7, 1.1, 0.4), M["metal"], root, 14)
    mk_sphere("Player_BeltGem", 0.032, (0, 0.11, 0.58), (1.1, 0.8, 1.0), M["cyan"], root, 10, 0)

    for o in bpy.data.objects:
        if o.parent == root and o.type == "MESH":
            if o.data.materials and o.data.materials[0] and o.data.materials[0].name in (
                "AR_SuitCloth",
                "AR_ArmorPlate",
            ):
                smart_uv(o)

    return root


def select_hierarchy(root: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for o in bpy.data.objects:
        if o.parent == root:
            o.select_set(True)
    bpy.context.view_layer.objects.active = root


def export_player(root: bpy.types.Object, filename: str = "riser-player.glb") -> str:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    select_hierarchy(root)
    bpy.ops.export_scene.gltf(
        filepath=path,
        use_selection=True,
        export_format="GLB",
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_yup=True,
        export_image_format="AUTO",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    verts = sum(
        len(o.data.vertices) for o in bpy.data.objects if o.parent == root and o.type == "MESH"
    )
    size = os.path.getsize(path) if os.path.exists(path) else 0
    print(f"Exported {filename}: verts~{verts} size={size}")
    return path


def main() -> None:
    clear_player()
    os.makedirs(TEX_DIR, exist_ok=True)
    albedo = make_panel_albedo_png(os.path.join(TEX_DIR, "player_panel.png"), 384)
    ao = make_ao_png(os.path.join(TEX_DIR, "player_ao.png"), 384)
    nrm = make_normal_png(os.path.join(TEX_DIR, "player_normal.png"), 384)
    orm = make_orm_png(os.path.join(TEX_DIR, "player_orm.png"), 384)
    M = build_materials(albedo, ao, nrm, orm)
    player = build_sculpt_player(M)
    path = export_player(player)
    print("SCULPT_PLAYER_EXPORTED", path, os.path.getsize(path))


if __name__ == "__main__":
    main()
