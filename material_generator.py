import os
import subprocess
import json
import shutil

def generate_material(input_mesh: str, material_descriptor: dict, output_folder: str):
    """
    Uses Substance Automation Toolkit to generate PBR textures.
    Args:
        input_mesh (str): Input mesh file (.obj).
        material_descriptor (dict): Material properties (e.g., {"metalness": 0.8, "roughness": 0.2}).
        output_folder (str): Folder to store generated textures.

    Returns:
        success (bool): True if generation succeeds; False otherwise.
    """
    try:
        # Check for SAT installation: either from environment variable (full path) or in PATH
        sat_bin = os.environ.get("SAT_INSTALL_PATH")
        if sat_bin:
            # Use explicitly configured path
            if not os.path.exists(sat_bin):
                raise ValueError(f"Substance Automation Toolkit not found at {sat_bin}. Check SAT_INSTALL_PATH.")
        else:
            # Try to find sbsrender in PATH
            sat_bin = shutil.which("sbsrender")
            if not sat_bin:
                raise ValueError("Substance Automation Toolkit not found. Either set SAT_INSTALL_PATH to the full path of sbsrender or ensure sbsrender is in your PATH.")
        
        # Ensure output folder exists
        os.makedirs(output_folder, exist_ok=True)
        
        param_file = os.path.join(output_folder, "material_params.json")
        with open(param_file, "w") as f:
            f.write(json.dumps(material_descriptor))

        subprocess.run([
            sat_bin, 
            "render", 
            "--mesh", input_mesh, 
            "--params", param_file, 
            "--output-path", output_folder
        ], check=True)
        print("[OK] Material generation complete.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Substance generation failed: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == "__main__":
    # Example of calling this function
    success = generate_material("input.obj", {"metalness": 0.9, "roughness": 0.5}, "./output/")
    if success:
        print("PBR texture generation successful.")
    else:
        print("PBR texture generation failed.")
