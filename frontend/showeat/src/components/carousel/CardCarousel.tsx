/* Import */
import styled from "@emotion/styled";
import Image from "next/image";
import Slider from "react-slick";
import { keyframes } from "@emotion/react";
import { useRef } from "react";
import { useRouter } from "next/router";
import { postBookmark } from "@/apis/fundings";
import Card from "../card";

// ----------------------------------------------------------------------------------------------------

/* Type */
interface CarouselProps {
    width: number;
    height: number;
    title: string;
    description: string;
    cardDatas: {
        fundingId: number;
        title: string;
        businessName: string;
        category: string;
        maxLimit: number;
        minLimit: number;
        curCount: number;
        menu: string;
        price: number;
        discountPrice: number;
        discountRate: number;
        startDate: string;
        endDate: string;
        fundingIsActive: string;
        fundingIsSuccess: string;
        fundingImageResponseDtos: {
            imageId: number;
            imageUrl: string;
        }[];
        fundingIsBookmark: boolean;
    }[];
}

// ----------------------------------------------------------------------------------------------------

/* Style */
const hoverAnimation = keyframes`
from {
  transform: scale(1)
}
to {
  transform: scale(1.1)
}
`;

const clickAnimation = keyframes`
from {
  transform: scale(1.1)
}
to {
  transform: scale(1.2)
}
`;

const CarouselContainer = styled("div")<Partial<CarouselProps>>`
    width: ${(props) => `${props.width}px`};
    height: ${(props) => `${props.height}px`};

    padding: 1em 0;
    margin: 4em 0;
`;

const CarouselHeaderContainer = styled("div")`
    display: flex;
    flex-direction: column;
`;

const CarouselTitleWrapper = styled("span")`
    font-size: 26px;
    font-weight: 700;
`;

const CarouselDescriptionWrapper = styled("span")`
    font-size: 16px;
    font-weight: 500;
    color: ${(props) => props.theme.colors.gray4};

    padding-top: 0.2em;
    padding-bottom: 2em;
`;

const CarouselCardsContainer = styled("div")<Partial<CarouselProps>>`
    width: ${(props) => `${props.width}px`};
    height: ${(props) => `${props.height}px`};

    position: relative;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const CarouselCardWrapper = styled("div")<Partial<CarouselProps>>`
    width: ${(props) => `${props.width}px`};
    height: ${(props) => `${props.height}px`};

    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
`;

const LeftArrowWrapper = styled("div")<{ height: number }>`
    width: 50px;
    height: ${(props) => `${props.height}px`};

    position: absolute;

    border-radius: 20px 0px 0px 20px;

    display: inline-flex;
    justify-content: center;
    align-items: center;

    cursor: pointer;

    transform: translateX(-100%);
    opacity: 0.5;
    z-index: 100;

    &:hover {
        background: rgba(0, 0, 0, 0.2); // 반투명한 회색 창
        opacity: 1;

        & img {
            animation: ${hoverAnimation} 0.2s linear forwards;
        }
    }

    &:active {
        background: rgba(0, 0, 0, 0.4); // 반투명한 회색 창
        opacity: 1;

        & img {
            animation: ${clickAnimation} 0.1s linear forwards;
        }
    }
`;

const RightArrowWrapper = styled("div")<{ height: number }>`
    width: 50px;
    height: ${(props) => `${props.height}px`};

    position: absolute;

    border-radius: 0px 20px 20px 0px;

    display: inline-flex;
    justify-content: center;
    align-items: center;

    cursor: pointer;

    transform: translateX(1920%) translateY(-100%);
    opacity: 0.5;
    z-index: 100;

    &:hover {
        background: rgba(0, 0, 0, 0.2); // 반투명한 회색 창
        opacity: 1;

        & img {
            animation: ${hoverAnimation} 0.2s linear forwards;
        }
    }

    &:active {
        background: rgba(0, 0, 0, 0.4); // 반투명한 회색 창
        opacity: 1;

        & img {
            animation: ${clickAnimation} 0.1s linear forwards;
        }
    }
`;

const ArrowImageWrapper = styled(Image)`
    //
`;

// ----------------------------------------------------------------------------------------------------

/* Card Carousel Component */
function CardCarousel({ width, height, title, description, cardDatas }: CarouselProps) {
    const settings = {
        infinite: true,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
    };

    const router = useRouter();

    const sliderRef = useRef<Slider | null>(null);

    const goToPrev = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPrev();
        }
    };

    const goToNext = () => {
        if (sliderRef.current) {
            sliderRef.current.slickNext();
        }
    };

    const handleCard = (fundingId: number) => {
        router.push(`/fundings/${fundingId}`);
    };

    const handleBookmark = (fundingId: number) => {
        postBookmark(fundingId);
    };
    return (
        <CarouselContainer width={width} height={height}>
            <CarouselHeaderContainer>
                <CarouselTitleWrapper>{title}</CarouselTitleWrapper>
                <CarouselDescriptionWrapper>{description}</CarouselDescriptionWrapper>
            </CarouselHeaderContainer>

            <CarouselCardsContainer width={width} height={height}>
                <LeftArrowWrapper height={height} onClick={goToPrev}>
                    <ArrowImageWrapper
                        src="/assets/icons/left-arrow-icon.svg"
                        alt="carousel-left-arrow"
                        width={40}
                        height={40}
                    />
                </LeftArrowWrapper>
                <Slider {...settings} ref={sliderRef}>
                    {cardDatas.map((cardData, idx) => (
                        <CarouselCardWrapper
                            key={`${cardData}-${idx}`}
                            width={width}
                            height={height}
                        >
                            <Card
                                fundingData={cardData}
                                onFundingClick={() => handleCard(cardData.fundingId)}
                                onBookmark={() => {
                                    handleBookmark(cardData.fundingId);
                                }}
                            />
                        </CarouselCardWrapper>
                    ))}
                </Slider>
                <RightArrowWrapper height={height} onClick={goToNext}>
                    <ArrowImageWrapper
                        src="/assets/icons/right-arrow-icon.svg"
                        alt="carousel-right-arrow"
                        width={40}
                        height={40}
                    />
                </RightArrowWrapper>
            </CarouselCardsContainer>
        </CarouselContainer>
    );
}

// ----------------------------------------------------------------------------------------------------

/* Export */
export default CardCarousel;