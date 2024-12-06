// Card.js
import React from 'react';

const Card = () => {
  return (
    <div className="card">
      <div className="card__content">
        <p className="card__title">Card Title</p>
        <p className="card__description">
          Date : 20-10-2024     <br/>
          User id : 1
        </p>
      </div>
      <style jsx>{`
        .card {
          position: relative;
          width: 300px;
          height: 200px;
          border-radius: 10px;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url('https://res.cloudinary.com/dhfj8pxy3/image/upload/v1732786714/chfqsux618s5yofsdv4s.jpg');
          background-size: cover;
          background-position: center;
        }

        .card:hover {
          transform: rotate(-5deg) scale(1.1);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .card__content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          width: 100%;
          height: 100%;
          padding: 20px;
          box-sizing: border-box;
          background-color: rgba(255, 255, 255, 0.8); /* Slightly transparent white background */
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card:hover .card__content {
          transform: translate(-50%, -50%) rotate(0deg);
          opacity: 1;
        }

        .card__title {
          margin: 0;
          font-size: 24px;
          color: #333;
          font-weight: 700;
        }

        .card__description {
          margin: 10px 0 0;
          font-size: 14px;
          color: #777;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default Card;
