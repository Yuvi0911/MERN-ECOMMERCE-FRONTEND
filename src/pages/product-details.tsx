/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { Navigate, useParams } from "react-router-dom";
import { useAllReviewsOfProductsQuery, useDeleteReviewMutation, useNewReviewMutation, useProductDerailsQuery } from "../redux/api/productAPI";
import { Skeleton } from "../components/loader";
import { CarouselButtonType, MyntraCarousel, Slider, useRating } from "6pp";
import { useRef, useState } from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import RatingsComponent from "../components/ratings";
import { CartItem, Review } from "../types/types";
import toast from "react-hot-toast";
import { addToCart } from "../redux/reducer/cartReducer";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit } from "react-icons/fi";
import { FaRegStar, FaStar, FaTrash } from "react-icons/fa";
import { RootState } from "../redux/store";
import { responseToast } from "../utils/features";

const ProductDetails = () => {
    const params = useParams();
    const { user } = useSelector((state: RootState) => state.userReducer);

    const { isLoading, isError, data } = useProductDerailsQuery(params.id!);
    const reviewsResponse = useAllReviewsOfProductsQuery(params.id!);

    const [carouselOpen, setCarouselOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [ reviewComment, setReviewComment ] = useState("");
    const [ reviewSubmitLoading, setReviewSubmitLoading ] = useState(false);

    // useRef ki help se hum dialog ko open krege bina page ko re-render kiye.
    const reviewDialogRef = useRef<HTMLDialogElement>(null);

    const [ createReview ] = useNewReviewMutation();

    const [ deleteReview ] = useDeleteReviewMutation();

    const decrement = () => {
      if(quantity <= 1){
        return ;
      }
      setQuantity((prev)=>prev-1) 
    }
  const increment = () => {
    if(data?.product?.stock === quantity){
      return toast.error(`${data?.product?.stock} available only`);
    }
    setQuantity((prev)=>prev+1) 
  }

    
  const dispatch = useDispatch();

  const addToCartHandler=(cartItem: CartItem)=>{
    if(cartItem.stock < 1){
      return toast.error("Out of Stock");
    }

 

    //dispatch ki help se hum addToCart ko call kr skte h jo ki humne cartReducer me bnaya h
    dispatch(addToCart(cartItem));
    toast.success("Added to Cart")
  };

  if(isError) return <Navigate to="/404" />

  // is dialog ki help se user comment likh shkta h kisi bhi product pr.
  const showDialog = () => {
    reviewDialogRef.current?.showModal();
  }
   
  // iski help se hum star ko show krege.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { Ratings: RatingsEditable, rating, setRating } = useRating({
        IconFilled: <FaStar />,
        IconOutline: <FaRegStar />,
        value:0,
        selectable: true,
        styles: {
            fontSize: "1.75rem",
            color: "coral",
            justifyContent: "flex-start"
        }
    });

    // iski help se hum review k dialog box ko close kr skte h.
    const reviewCloseHandler = () => {
      reviewDialogRef.current?.close();
      setRating(0);
      setReviewComment("");
    }

    // jaise hi user comment ko submit krega toh ye function call ho jaiye ga.
    const submitReview = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setReviewSubmitLoading(true);
      // jaise hi comment ko submit krege toh dialog ko close kr dege.
      reviewCloseHandler();

      // in information k sath naya review create kr dega.
      const res = await createReview({
        comment: reviewComment,
        rating,
        userId: user?._id,
        productId: params.id!,
      });

      setReviewSubmitLoading(false);

      responseToast(res, null, "");
    }

    // iski help se jis user ne  review/comment kiya h vo us review/comment ko delete kr skte h.
    const handleDeleteReview = async (reviewId: string) => {
      const res = await deleteReview({
        reviewId,
        userId: user?._id,
      });

      responseToast(res, null, "");
    }


  return (
    <div className="product-details">
      {
        isLoading ? (
          <ProductLoader />
        ) : (
          <>
            <main>
              <section>
                <Slider 
                  showThumbnails
                  showNav={false}
                  onClick={() => setCarouselOpen(true)}
                  images={data?.product?.photos.map((i) => i.url) || []}
                />
               {
                carouselOpen &&  (<MyntraCarousel
                NextButton={NextButton}
                PrevButton={PrevButton}
                setIsOpen={setCarouselOpen}
                images={data?.product?.photos.map((i) => i.url) || []}
              />)
               }
              </section>

              <section>
                <code>{data?.product?.category}</code>
                <h1>{data?.product?.name}</h1>
                <em style={{display: "flex", gap: "1rem", alignItems: "center"}}>
                 <RatingsComponent value={data?.product?.ratings || 0} />
                  ({data?.product?.numOfReviews} reviews)
                </em>
                <h3>₹{data?.product?.price}</h3>
                <article>
      <div>
        <button onClick={decrement}>-</button>
        <span>{quantity}</span>
        <button onClick={increment}>+</button>
      </div>
      <button onClick={() => addToCartHandler({
        productId: data?.product?._id!,
        name: data?.product?.name!,
        price: data?.product?.price!,
        stock: data?.product?.stock!,
        quantity,
        photo: data?.product?.photos[0].url || "",
      })}>Add to Cart</button>
    </article>
                <p>{data?.product?.description}</p>
              </section>
            </main>
          </>
        )
      }

      <dialog ref={reviewDialogRef} className="review-dialog">
        <button onClick={reviewCloseHandler}>X</button>
        <h2>Write a Review</h2>
        <form onSubmit={submitReview}>
          <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Review..."></textarea>
          <RatingsEditable />
          <button disabled={reviewSubmitLoading} type="submit">
            Submit
          </button>
        </form>
      </dialog>

       <section>
        <article>
          <h2>Reviews</h2>
          {
            reviewsResponse.isLoading ? null : (
              user && (
                <button onClick={showDialog}>
                <FiEdit />
              </button>
              )
            )
          }

        </article>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            overflowX: "auto",
            padding: "2rem",
          }}
        >
        {
          reviewsResponse.isLoading ? (
            <>
              <Skeleton width="45rem" length={5} />
              <Skeleton width="45rem" length={5} />
              <Skeleton width="45rem" length={5} />
            </>
          ) : (
            reviewsResponse.data?.reviews.map((review) => (
             <>
              <ReviewCard handleDeleteReview={handleDeleteReview}  userId={user?._id} key={review._id} review={review} />
             </>
            ))
          )
        }
        </div>
       </section>
    </div>
  )
}

const ReviewCard = ({
  review,
  userId,
  handleDeleteReview
} : {
  userId?: string;
  review: Review;
  handleDeleteReview: (reviewId: string) => void;
}) => {
  console.log(review.user.photo);
  return (
    <div className="review">
    <RatingsComponent value={review.rating} />
    <p>{review.comment}</p>
    <div>
      <img src={review.user.photo} alt="" />
      <small>{review.user.name}</small>
    </div>
    {
      userId === review.user._id && (
        <button onClick={() => handleDeleteReview(review._id)}>
          <FaTrash />
        </button>
      )
    }
  </div>
  )
}

const ProductLoader = () => {
    return (
      <div style={{
        display: "flex",
        gap: "2rem",
        height: "80vh"
      }}>
        <section style={{width: "100%", height: "100%"}}>
          <Skeleton width="100%" containerHeight="100%" height="100%" length={1}/>
        </section>
        <section style={{
          width: "100%", 
          // border: "1px solid pink", 
          display: "flex", 
          flexDirection: "column", 
          gap:"4rem", 
          padding: "2rem"
        }}>
          <Skeleton width="40%" length={3}/>
          <Skeleton width="50%" length={4}/>
          <Skeleton width="100%" length={2}/>
          <Skeleton width="100%" length={10}/>
        </section>
      </div> 
    )
}

const NextButton: CarouselButtonType = ({onClick}) =>( 
  <button 
    onClick={onClick}
    className="carousel-btn"
  >
    <FaArrowRightLong />
  </button>
)

const PrevButton: CarouselButtonType = ({onClick}) => ( 
  <button 
    onClick={onClick} 
    className="carousel-btn"
  >
    <FaArrowLeftLong />
  </button>
)

export default ProductDetails;
