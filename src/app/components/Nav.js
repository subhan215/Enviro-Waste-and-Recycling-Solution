import React from "react" ; 
const Nav = () => {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7f3ea] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0e1b11]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-[#0e1b11] text-lg font-bold leading-tight tracking-[-0.015em]">Enviro</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-[#0e1b11] text-sm font-medium leading-normal" href="#">
                Home
              </a>
              <a className="text-[#0e1b11] text-sm font-medium leading-normal" href="#">
                About Us
              </a>
              <a className="text-[#0e1b11] text-sm font-medium leading-normal" href="#">
                Services
              </a>
              <a className="text-[#0e1b11] text-sm font-medium leading-normal" href="#">
                Contact
              </a>
            </div>
          </div>
        </header>

    )
}
export default Nav;