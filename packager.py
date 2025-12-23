import os
import shutil
import subprocess

def package_assets(mesh_file: str, texture_folder: str, output_path: str):
    """
    Packages mesh and textures into Unreal Engine `.uasset`.
    Args:
        mesh_file (str): Path to input mesh file (.obj).
        texture_folder (str): Path to texture folder.
        output_path (str): Path for output `.uasset`.

    Returns:
        success (bool): True if packaging succeeds; False otherwise.
    """
    try:
        unreal_bin = shutil.which("ue-packer")
        if not unreal_bin:
            raise ValueError("Unreal Packer tool not found.")

        subprocess.run([
            unreal_bin, 
            "--mesh", mesh_file, 
            "--textures", texture_folder, 
            "--output", output_path
        ], check=True)
        print(f"[OK] Asset packaged: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Packaging failed: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == "__main__":
    # Example of calling this function
    success = package_assets("input.obj", "./textures/", "./output/output.uasset")
    if success:
        print("Asset packaging successful.")
    else:
        print("Asset packaging failed.")
