import React, { useState, useEffect } from 'react';
import M from 'materialize-css/dist/js/materialize.min.js';
import 'materialize-css/dist/css/materialize.min.css';
import './App.css'; // Importa tu archivo CSS personalizado

const CardInfoComponent = () => {
  const [cardName, setCardName] = useState('');
  const [cardInfo, setCardInfo] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    M.AutoInit();
  }, []);

  const fetchCardInfo = async (name) => {
    try {
      const encodedName = encodeURIComponent(name);
      const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodedName}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.data.length > 0) {
        setCardInfo(data.data[0]);
        setError(null);
      } else {
        setError('Card not found.');
        setCardInfo(null);
      }
      setSuggestions([]);
    } catch (error) {
      setError(error.message);
      setCardInfo(null);
    }
  };

  const fetchSuggestions = async (value) => {
    try {
      const encodedTerm = encodeURIComponent(value.trim());
      const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodedTerm}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const suggestions = data.data.slice(0, 10).map(card => ({
        id: card.id,
        name: card.name,
        image: card.card_images.length > 0 ? card.card_images[0].image_url : null
      }));
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setCardName(value);
    if (value.trim() === '') {
      setSuggestions([]);
      setCardInfo(null);
      return;
    }
    fetchSuggestions(value);
  };

  const handleSelectSuggestion = (card) => {
    setCardName(card.name);
    fetchCardInfo(card.name);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchCardInfo(cardName);
  };

  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
    const elem = document.getElementById('image_modal');
    const instance = M.Modal.init(elem);
    instance.open();
  };

  const handleCloseModal = () => {
    setExpandedImage(null);
  };

  const getPrimaryImage = () => {
    if (cardInfo && cardInfo.card_images.length > 0) {
      return cardInfo.card_images[0].image_url;
    }
    return '';
  };

  return (
    <div className="container" style={{ backgroundColor: '#282c34', minHeight: '100vh', paddingTop: '20px' }}>
      <h1 className="center-align white-text">Yu-Gi-Oh! Card Info</h1>
      <div className="row">
        <form className="col s12" onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              id="card_name"
              type="text"
              className="validate white-text yellow-border"
              value={cardName}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <label htmlFor="card_name" className="white-text">Enter Card Name</label>
          </div>
          <button type="submit" className="waves-effect waves-light btn yellow darken-2" style={{ marginBottom: '20px' }}>
            Search
          </button>
        </form>
      </div>

      {error && <p className="red-text">{error}</p>}

      {suggestions.length > 0 && (
        <ul className="collection with-header">
          <li className="collection-header white-text"><h5>Suggestions</h5></li>
          {suggestions.map(card => (
            <li
              key={card.id}
              className="collection-item avatar"
              style={{ cursor: 'pointer', color: 'black' }}
              onClick={() => handleSelectSuggestion(card)}
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.name}
                  className="circle responsive-img"
                  style={{ height: 'auto', maxWidth: '100px', borderRadius: '5px' }}
                  onClick={() => handleImageClick(card.image)}
                />
              )}
              <span className="title">{card.name}</span>
            </li>
          ))}
        </ul>
      )}

      {cardInfo && (
        <div className="card horizontal" style={{ backgroundColor: '#282c34', color: 'white' }}>
          <div className="card-image">
            <img
              src={getPrimaryImage()}
              alt={cardInfo.name}
              className="responsive-img"
              onClick={() => handleImageClick(getPrimaryImage())}
              style={{ cursor: 'pointer', borderRadius: '5px' }}
            />
          </div>
          <div className="card-stacked">
            <div className="card-content left-align">
            <h4 className="center-align" style={{ textTransform: 'uppercase', color: '#C89924' }}>{cardInfo.name}</h4>
            <p><strong>Attribute:</strong> {cardInfo.attribute}</p>
              <p><strong>Type:</strong> {cardInfo.type}</p>
              <p><strong>Attack:</strong> {cardInfo.atk}</p>
              <p><strong>Defense:</strong> {cardInfo.def}</p>
              <p><strong>Description:</strong> {cardInfo.desc}</p>
              <br />
              {cardInfo.card_images.length > 1 && (
                <div className="row">
                  {cardInfo.card_images.slice(1).map((image, index) => (
                    <div key={index} className="col s6 m4 l3">
                      <img
                        src={image.image_url}
                        alt={cardInfo.name}
                        className="responsive-img"
                        onClick={() => handleImageClick(image.image_url)}
                        style={{ cursor: 'pointer', marginBottom: '10px', borderRadius: '5px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {expandedImage && (
        <div
          id="image_modal"
          className="modal modal-fixed-footer"
          style={{ maxWidth: '90%', maxHeight: '90%' }}
        >
          <div className="modal-content center-align">
            <img src={expandedImage} alt="Expanded Card" className="responsive-img" style={{ maxHeight: '80vh', maxWidth: '100%' }} />
          </div>
          <div className="modal-footer">
            <button className="modal-close waves-effect waves-green btn-flat" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardInfoComponent;
