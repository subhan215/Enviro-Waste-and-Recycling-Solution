// middleware.js
import { NextResponse } from 'next/server';
//import { pool } from './database/database';
export async function middleware(req) {
  console.log("entering middleware!");
  const accessToken = req.cookies.get('access_token').value?.replace(/^["']|["']$/g, ''); // Get token from cookies
  console.log("accessToken: " , accessToken);
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  try {
    // Fetch user data from the API route
    const response = await fetch(`${req.nextUrl.origin}/api/auth_middleware`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    console.log("user verified!") ; 
    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.error();
  }
}

// Matcher configuration: only apply middleware to specific routes
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*' , "/asjahjsa"], // Apply middleware to these routes
};
