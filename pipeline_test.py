import os
from material_generator import generate_material
from packager import package_assets

def test_pipeline(mesh_file: str):
    """
    Tests the pipeline from mesh generation to asset packaging.
    Args:
        mesh_file (str): Input mesh file.
    """
    texture_folder = "./textures/"
    output_path = "./output/output.uasset"
    
    # Ensure output directories exist
    os.makedirs(texture_folder, exist_ok=True)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    print("=== Testing Material Generation ===")
    material_descriptor = {
        "metalness": 0.8,
        "roughness": 0.3
    }
    if generate_material(mesh_file, material_descriptor, texture_folder):
        print("[OK] Texture generation successful.")
    else:
        print("[ERROR] Texture generation failed.")
        return
    
    print("=== Testing Package ===")
    if package_assets(mesh_file, texture_folder, output_path):
        print("[OK] Packaging successful.")
    else:
        print("[ERROR] Packaging failed.")

if __name__ == "__main__":
    # Test with an example mesh file (replace 'input.obj' with actual mesh file path)
    test_pipeline("input.obj")
