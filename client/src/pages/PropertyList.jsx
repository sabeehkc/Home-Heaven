import "../styles/List.scss";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { BASE_URL } from "../redux/constants";
import { setPropertyList } from "../redux/state";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";

const PropertyList = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const propertyList = useSelector((state) => state?.user?.propertyList);

  const getPropertyList = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/${user?._id}/properties`,
        {
          method: "GET",
        },
      );

      const data = await response.json();
      dispatch(setPropertyList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Property List Failed", err.message);
    }
  };

  useEffect(() => {
    getPropertyList();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Property List</h1>
      <div className="list">
        {propertyList?.length === 0 ? (
          <h2 style={{ width: "100%", textAlign: "center", marginTop: "50px" }}>
            No Properties Found
          </h2>
        ) : (
          propertyList?.map(
            ({
              _id,
              creator,
              listingPhotoPaths,
              city,
              province,
              country,
              category,
              type,
              price,
              booking = false,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                listingPhotoPaths={listingPhotoPaths}
                city={city}
                province={province}
                country={country}
                category={category}
                type={type}
                price={price}
                booking={booking}
              />
            ),
          )
        )}
      </div>
      <Footer />
    </>
  );
};

export default PropertyList;
