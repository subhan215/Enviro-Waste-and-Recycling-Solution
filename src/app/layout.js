"use client";
import Nav from './components/Nav';
import './globals.css'; // Import global styles
import { ReduxProvider } from "../store/Provider";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from '../store/slices/userDataSlice';
import { getCookie } from '../cookies/getCookie';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <LayoutContent>
            <div className="layout-container flex h-full grow flex-col relative flex min-h-screen flex-col bg-[#f8fcf9] overflow-x-hidden">
              <Nav />
              <main>{children}</main>
            </div>
          </LayoutContent>
        </ReduxProvider>
      </body>
    </html>
  );
}

// Separate component to ensure use of hooks inside the Provider
function LayoutContent({ children }) {
  let access_token = getCookie(`access_token`);
  access_token = access_token?.replace(/"/g, ''); 
  console.log(access_token)
  const dispatch = useDispatch();
  const navigate = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth_middleware', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken: access_token }), // Use the token from cookies
        });

        const data = await response.json();

        if (data.success) {
          dispatch(setUserData({ ...data.user, role: data.role }));
        } else {
          //console.log("Data not found!");
          //alert("asasa")
          //navigate.push('/signin'); // Redirect if user data is not found
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUserData();
  }, [navigate, dispatch , access_token]);

  return <>{children}</>;
}
