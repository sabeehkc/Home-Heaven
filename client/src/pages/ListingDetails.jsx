import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";

import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import { BASE_URL } from "../redux/constants";
import io from "socket.io-client";
import { Send } from "@mui/icons-material";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);

  const { listingId } = useParams();
  const [listing, setListing] = useState(null);

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, []);

//   console.log(listing)


  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    // Update the selected date range when user makes a selection
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.round(end - start) / (1000 * 60 * 60 * 24); // Calculate the difference in day unit

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.user?._id)

  const navigate = useNavigate()

  /* CHAT LOGIC */
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const hostId = listing?.creator?._id;

  const isHost = customerId === hostId;
  const [guestList, setGuestList] = useState([]);
  const [selectedGuestId, setSelectedGuestId] = useState(null);

  // Fetch guests if user is host
  useEffect(() => {
    if (customerId && hostId && isHost) {
      const fetchGuests = async () => {
        try {
          const res = await fetch(`${BASE_URL}/messages/guests/${listingId}/${hostId}`);
          const data = await res.json();
          setGuestList(data);
          if (data.length > 0) {
            setSelectedGuestId(data[0]._id); // default select first
          }
        } catch (err) {
          console.log("Fetch guests failed", err);
        }
      };
      fetchGuests();
    }
  }, [customerId, hostId, listingId, isHost]);

  const chatPartnerId = isHost ? selectedGuestId : hostId;

  useEffect(() => {
    if (customerId && hostId && chatPartnerId) {
      const newSocket = io(BASE_URL.replace("/api", "")); // Connect to server
      setSocket(newSocket);

      const room = `${listingId}-${[customerId, chatPartnerId].sort().join("-")}`;
      newSocket.emit("join_room", room);

      const fetchMessages = async () => {
        try {
          const res = await fetch(`${BASE_URL}/messages/${listingId}/${customerId}/${chatPartnerId}`);
          const data = await res.json();
          setMessages(data);
        } catch (err) {
          console.log("Fetch messages failed", err);
        }
      };
      fetchMessages();

      return () => newSocket.close();
    } else {
      setMessages([]);
    }
  }, [customerId, hostId, listingId, chatPartnerId]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (message) => {
        setMessages((prev) => {
          // Prevent duplicate messages if already in state
          if (prev.find(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      });
    }
  }, [socket]);

  const sendMessage = () => {
    if (newMessage.trim() !== "" && socket && chatPartnerId) {
      const room = `${listingId}-${[customerId, chatPartnerId].sort().join("-")}`;
      const messageData = {
        room,
        listingId,
        senderId: customerId,
        receiverId: chatPartnerId,
        text: newMessage,
      };
      socket.emit("send_message", messageData);
      setNewMessage("");
    }
  };

  const handleSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      }

      const response = await fetch(`${BASE_URL}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm)
      })

      if (response.ok) {
        navigate(`/${customerId}/trips`)
      }
    } catch (err) {
      console.log("Submit Booking Failed.", err.message)
    }
  }

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      
      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item, index) => (
            <img
              key={index}
              src={`${BASE_URL}/${item.replace("public", "")}`}
              alt="listing photo"
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={`${BASE_URL}/${listing.creator.profileImagePath.replace(
              "public",
              ""
            )}`}
          />
          <h3>
            Hosted by {listing.creator.firstName} {listing.creator.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities[0].split(",").map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              {dayCount > 1 ? (
                <h2>
                  ${listing.price} x {dayCount} nights
                </h2>
              ) : (
                <h2>
                  ${listing.price} x {dayCount} night
                </h2>
              )}

              <h2>Total price: ${listing.price * dayCount}</h2>
              <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toDateString()}</p>

              <button className="button" type="submit" onClick={handleSubmit}>
                BOOKING
              </button>
            </div>
          </div>
        </div>

        {customerId && (isHost ? guestList.length > 0 : true) && (
          <div className="chat-container">
            <h2>{isHost ? "Chat with Guests" : "Chat with Host"}</h2>
            
            <div className="chat-layout">
              {isHost && (
                <div className="guest-list">
                  {guestList.map(guest => (
                    <div 
                      key={guest._id} 
                      className={`guest-item ${selectedGuestId === guest._id ? 'selected' : ''}`}
                      onClick={() => setSelectedGuestId(guest._id)}
                    >
                      <img src={`${BASE_URL}/${guest.profileImagePath.replace("public", "")}`} alt="profile" />
                      <p>{guest.firstName} {guest.lastName}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="chat-box">
                <div className="chat-messages">
                  {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.senderId === customerId ? 'sent' : 'received'}`}>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} className="send-btn"><Send /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;