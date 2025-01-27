import { FormEvent, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useSelector } from "react-redux";
import { UserReducerInitialState } from "../../../types/reducer-types";
import { useNewProductMutation } from "../../../redux/api/productAPI";
import { useNavigate } from "react-router-dom";
import { responseToast } from "../../../utils/features";
import { useFileHandler } from "6pp";

const NewProduct = () => {

  const { user } = useSelector(
    (state: {userReducer: UserReducerInitialState})=>state.userReducer
  )

  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<number>(1000);
  const [stock, setStock] = useState<number>(1);
  const [description, setDescription] = useState<string>("");
  // const [photoPrev, setPhotoPrev] = useState<string>("");
  // const [photo, setPhoto] = useState<File>();
  const [loading, setLoading] = useState<boolean>(false);

  const [newProduct] = useNewProductMutation();
  const navigate = useNavigate();

  // const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
  //   const file: File | undefined = e.target.files?.[0];

  //   const reader: FileReader = new FileReader();

  //   if (file) {
  //     reader.readAsDataURL(file);
  //     reader.onloadend = () => {
  //       if (typeof reader.result === "string") {
  //         setPhotoPrev(reader.result);
  //         setPhoto(file);
  //       }
  //     };
  //   }
  // };

  // ye function 6pp package me import kiya h jo ki 10mb ki 5 files ko handle krega.
  const photos = useFileHandler("multiple", 10, 5);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

    try {
      
      if(!name || !price || stock < 0 || !category){
        return;
      }
      if(!photos.file || photos.file.length === 0){
        return;
      }

      const formData = new FormData();

      formData.set("name", name);
      formData.set("description", description);
      formData.set("price", price.toString());
      formData.set("stock", stock.toString());
      // formData.set("photo", photo);
      formData.set("category", category);

      photos.file.forEach((file) => {
        formData.append("photos", file)
      })

      if (user && user._id) {
         const res = await newProduct({ id: user._id, formData });
         responseToast(res, navigate, "/admin/product")
         setLoading(false);
         
      } else {
        console.log(" user or user._id is null or undefined")
        // setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false);
    }

  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <article>
          <form onSubmit={submitHandler}>
            <h2>New Product</h2>
            <div>
              <label>Name</label>
              <input
              required
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
     
            <div>
              <label>Description</label>
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label>Price</label>
              <input
              required
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Stock</label>
              <input
              required
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Category</label>
              <input
              required
                type="text"
                placeholder="eg. laptop, camera etc"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label>Photos</label>
              <input 
              required
              type="file" accept="image/*" multiple onChange={photos.changeHandler} />
            </div>

            {
              photos.error && <p>{photos.error}</p>
            }
            {photos.preview && photos.preview.map((img,i)=>(
              <img key={i} src={img} alt="New Image"/>
            ))}

            {/* {photoPrev && <img src={photoPrev} alt="New Image" />} */}
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default NewProduct;
