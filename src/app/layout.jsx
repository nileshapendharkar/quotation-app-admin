import './globals.css';

export const metadata = {
  title: 'Product Quotation App - Admin Panel',
  description: 'Manage products, categories, users, and quotation requests without pricing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
