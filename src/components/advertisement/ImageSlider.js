import React from 'react';
const IMAGEURL = process.env.REACT_APP_CLOUDINARY;

const Slide = ({image}) => {
  //console.log(image);
    const imageStyle = {
        height: "300px",
        width: "200px",
        padding: "0px",
        margin: "0px",
        fontSize: "50px"
    }
    return (
      <React.Fragment>
      { image === undefined ? null : <img src={IMAGEURL+image.filename} style={imageStyle} alt="Sliderr_image" />
      }
      </React.Fragment>
    );
  };
const ImageSlider = ({advertise}) => {
  //console.log('Advertise in slider', advertise);
    const [currentSlide, setCurrentSlide] = React.useState(0);
    // const slides = [
    //     "mujibborsho.jpg",
    //     "quarterfinal.jpg"
    // ];
    // const slideNext = (e) => {
    //   setCurrentSlide((prev) => {
    //     return prev + 1 === slides.length ? 0 : currentSlide + 1;
    //   });
    // };
    // const slidePrev = (e) => {
    //   setCurrentSlide((prev) => {
    //     return prev === 0 ? slides.length - 1 : currentSlide - 1;
    //   });
    // };
    React.useEffect(() => {
      const intervalId = setInterval(() => {
        setCurrentSlide((prev) => {
          return prev + 1 === advertise.length ? 0 : prev + 1;
        });
      }, 5000);
      return () => {
        clearInterval(intervalId);
      };
    }, [advertise.length]);
    return (
      <React.Fragment>
        <Slide
          image={advertise[currentSlide]}
        />
      </React.Fragment>
    );
  };
export default ImageSlider
  