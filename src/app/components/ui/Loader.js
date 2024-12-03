import React from 'react';
import styled from "styled-components"

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="tree">
          <div className="branch" style={{ '--x': 0 }}>
            <span style={{ '--i': 0 }} />
            <span style={{ '--i': 1 }} />
            <span style={{ '--i': 2 }} />
            <span style={{ '--i': 3 }} />
          </div>
          <div className="branch" style={{ '--x': 1 }}>
            <span style={{ '--i': 0 }} />
            <span style={{ '--i': 1 }} />
            <span style={{ '--i': 2 }} />
            <span style={{ '--i': 3 }} />
          </div>
          <div className="branch" style={{ '--x': 2 }}>
            <span style={{ '--i': 0 }} />
            <span style={{ '--i': 1 }} />
            <span style={{ '--i': 2 }} />
            <span style={{ '--i': 3 }} />
          </div>
          <div className="branch" style={{ '--x': 3 }}>
            <span style={{ '--i': 0 }} />
            <span style={{ '--i': 1 }} />
            <span style={{ '--i': 2 }} />
            <span style={{ '--i': 3 }} />
          </div>
          <div className="stem">
            <span style={{ '--i': 0 }} />
            <span style={{ '--i': 1 }} />
            <span style={{ '--i': 2 }} />
            <span style={{ '--i': 3 }} />
          </div>
          <span className="shadow" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white background */
  z-index: 9999; /* Ensure it overlays all other content */

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tree {
    position: relative;
    width: 50px;
    height: 50px;
    transform-style: preserve-3d;
    transform: rotateX(-20deg) rotateY(30deg);
    animation: treeAnimate 5s linear infinite;
  }

  @keyframes treeAnimate {
    0% {
      transform: rotateX(-20deg) rotateY(360deg);
    }

    100% {
      transform: rotateX(-20deg) rotateY(0deg);
    }
  }

  .tree div {
    position: absolute;
    top: -50px;
    left: 0;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateY(calc(25px * var(--x))) translateZ(0px);
  }

  .tree div.branch span {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #69c069, #77dd77);
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    border-bottom: 5px solid #00000019;
    transform-origin: bottom;
    transform: rotateY(calc(90deg * var(--i))) rotateX(30deg) translateZ(28.5px);
  }

  .tree div.stem span {
    position: absolute;
    top: 110px;
    left: calc(50% - 7.5px);
    width: 15px;
    height: 50%;
    background: linear-gradient(90deg, #bb4622, #df7214);
    border-bottom: 5px solid #00000019;
    transform-origin: bottom;
    transform: rotateY(calc(90deg * var(--i))) translateZ(7.5px);
  }

  .shadow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    filter: blur(20px);
    transform-style: preserve-3d;
    transform: rotateX(90deg) translateZ(-65px);
  }
`;

export default Loader;
