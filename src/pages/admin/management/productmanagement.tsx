import { FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useSelector } from "react-redux";
import { UserReducerInitialState } from "../../../types/reducer-types";
import { useDeleteProductMutation, useProductDerailsQuery, useUpdateProductMutation } from "../../../redux/api/productAPI";
import { Navigate, useNavigate, useParams } from "react-router-dom";
// import { server } from "../../../redux/store";
import { Skeleton } from "../../../components/loader";
import { responseToast, transformImage } from "../../../utils/features";
import { useFileHandler } from "6pp";



const Productmanagement = () => {

  const { user } = useSelector(
    (state: { userReducer: UserReducerInitialState}) => state.userReducer
  )

  const params = useParams();
  const navigate = useNavigate();

  const {data, isLoading, isError} = useProductDerailsQuery(params.id!)



  const {price, photos, name, stock, category, description} = data?.product || {
        photos: [],
        category: "",
        name: "",
        stock: 0,
        price: 0,
        description: ""
  };

  const [priceUpdate, setPriceUpdate] = useState<number>(price);
  const [stockUpdate, setStockUpdate] = useState<number>(stock);
  const [nameUpdate, setNameUpdate] = useState<string>(name);
  const [categoryUpdate, setCategoryUpdate] = useState<string>(category);
  const [descriptionUpdate, setDescriptionUpdate] = useState<string>(description);
  // const [photoUpdate, setPhotoUpdate] = useState<string>("");
  // const [photoFile, setPhotoFile] = useState<File>();

  const [loading, setLoading] = useState<boolean>(false);

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
  //   const file: File | undefined = e.target.files?.[0];

  //   const reader: FileReader = new FileReader();

  //   if (file) {
  //     reader.readAsDataURL(file);
  //     reader.onloadend = () => {
  //       if (typeof reader.result === "string") {
  //         setPhotoUpdate(reader.result);
  //         setPhotoFile(file);
  //       }
  //     };
  //   }
  // };

  const photosFiles = useFileHandler("multiple", 10, 5);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      if(nameUpdate) {
        formData.set("name",nameUpdate);
      }
      if(descriptionUpdate) {
        formData.set("description", descriptionUpdate);
      }
      if(priceUpdate) {
        formData.set("price",priceUpdate.toString());
      }
      if(stockUpdate !== undefined) {
        formData.set("stock",stockUpdate.toString());
      }
      // if(photoFile) {
      //   formData.set("photo",photoFile);
      // }
      if(categoryUpdate) {
        formData.set("category",categoryUpdate);
      }


      if(photosFiles.file && photosFiles.file.length > 0){
        photosFiles.file.forEach((file) => {
          formData.append("photos", file);
        })
      }
  
      if (user && user._id && data && data.product && data.product._id) {
  
        const res = await updateProduct({
          formData,
          userId: user._id,
          productId: data.product._id,
        });
  
        responseToast(res, navigate, "/admin/product");
      } 
      else {
       console.log("user or product doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setLoading(false);
    }

  };

  const deleteHandler = async () => {

    if (user && user._id && data && data.product && data.product._id) {
      const res = await deleteProduct({
        userId: user._id,
        productId: data.product._id,
      });

      responseToast(res, navigate, "/admin/product");
    } 
    else {
     console.log("user or product doesn't exist");
    }

  }

  useEffect(()=> {
    if(data) {
      setNameUpdate(data.product.name);
      setPriceUpdate(data.product.price);
      setStockUpdate(data.product.stock);
      setCategoryUpdate(data.product.category);
      setDescriptionUpdate(data.product.description)
    }
  },[data])

  if(isError){
    return <Navigate to={"/404"}/>
  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
       {
        isLoading? <Skeleton length={15}/> : (
          <>
           <section>
          <strong>ID - {data?.product._id}</strong>
          <img src={transformImage(photos?.[0]?.url)} alt="Product" />
          <p>{name}</p>
          {stock > 0 ? (
            <span className="green">{stock} Available</span>
          ) : (
            <span className="red"> Not Available</span>
          )}
          <h3>₹{price}</h3>
        </section>
        <article>
          <button className="product-delete-btn" onClick={deleteHandler}>
            <FaTrash />
          </button>
          <form onSubmit={submitHandler}>
            <h2>Manage</h2>
            <div>
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={nameUpdate}
                onChange={(e) => setNameUpdate(e.target.value)}
              />
            </div>
            <div>
            <label>Description</label>
              <textarea
                placeholder="Description"
                value={descriptionUpdate}
                onChange={(e) => setDescriptionUpdate(e.target.value)}
              />
            </div>
            <div>
              <label>Price</label>
              <input
                type="number"
                placeholder="Price"
                value={priceUpdate}
                onChange={(e) => setPriceUpdate(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Stock</label>
              <input
                type="number"
                placeholder="Stock"
                value={stockUpdate}
                onChange={(e) => setStockUpdate(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Category</label>
              <input
                type="text"
                placeholder="eg. laptop, camera etc"
                value={categoryUpdate}
                onChange={(e) => setCategoryUpdate(e.target.value)}
              />
            </div>

            <div>
              <label>Photos</label>
              <input 
              type="file" accept="image/*" multiple onChange={photosFiles.changeHandler} />
            </div>

            {
              photosFiles.error && <p>{photosFiles.error}</p>
            }
            {
              photosFiles.preview && (
                <div style={{ display: "flex", gap:"1rem", overflowX: "auto"}}>
                  {
                    photosFiles.preview.map((img, i) => (
                      <img style={{width:100, height:100, objectFit: "cover"}} key={i} src={img} alt="New Image" />
                    ))
                  }
                </div>
              )
            }

            {/* {photoUpdate && <img src={photoUpdate} alt="New Image" />} */}
            <button type="submit" disabled={loading}>
              {
                loading ? "Updating..." : "Update"
              }
            </button>
          </form>
        </article>
        </>
        )
       }
      </main>
    </div>
  );
};

export default Productmanagement;
