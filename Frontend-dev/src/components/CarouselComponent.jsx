import React from 'react';
import { Carousel } from 'react-bootstrap';
import FoodPantrySlide from './FoodPantrySlide';
import GroceriesFoodSlide from './GroceriesFoodSlide';

const CarouselComponent = () => {
  return (
    <Carousel controls={false} indicators interval={3000} pause={false} fade>
      <Carousel.Item>
        <FoodPantrySlide />
      </Carousel.Item>

      <Carousel.Item>
        <GroceriesFoodSlide />
      </Carousel.Item>
    </Carousel>
  );
};

export default CarouselComponent;
