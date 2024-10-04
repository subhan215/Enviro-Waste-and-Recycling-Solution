
import Nav from './components/Nav';
import './globals.css'; // Import global styles
//import Footer from './components/Footer'; // Import your Footer component

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <div className="layout-container flex h-full grow flex-col relative flex min-h-screen flex-col bg-[#f8fcf9] overflow-x-hidden">
      <Nav />
        <main>{children}</main>
        </div>
      </body>
    </html>
  );
}