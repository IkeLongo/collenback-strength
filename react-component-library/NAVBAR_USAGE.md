# Navbar Component

A configurable React navbar component with mobile menu support.

## Usage

### Basic Usage (with default navigation)

```tsx
import { Navbar } from '@IkeLongo/react-component-library';

function App() {
  return (
    <Navbar logoSrc="/path/to/your/logo.png" />
  );
}
```

### Custom Navigation Links

```tsx
import { Navbar, NavLink } from '@IkeLongo/react-component-library';

const customNavLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

function App() {
  return (
    <Navbar 
      logoSrc="/path/to/your/logo.png"
      navLinks={customNavLinks}
      showBookingButton={true}
      showLoginButton={true}
      bookingText="Get Started"
      loginText="Sign In"
      bookingHref="/signup"
      loginHref="/signin"
      backgroundColor="bg-blue-600"
    />
  );
}
```

### Minimal Setup (no buttons)

```tsx
import { Navbar } from '@IkeLongo/react-component-library';

const navLinks = [
  { name: 'Products', href: '/products' },
  { name: 'Blog', href: '/blog' },
];

function App() {
  return (
    <Navbar 
      logoSrc="/logo.png"
      navLinks={navLinks}
      showBookingButton={false}
      showLoginButton={false}
    />
  );
}
```

### Custom Background Color

```tsx
import { Navbar } from '@IkeLongo/react-component-library';

function App() {
  return (
    <Navbar 
      logoSrc="/logo.png"
      backgroundColor="bg-purple-600"
      bookingText="Join Now"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logoSrc` | `string` | `undefined` | Optional. URL to your logo image |
| `navLinks` | `NavLink[]` | Default links | Array of navigation links |
| `showBookingButton` | `boolean` | `true` | Whether to show the booking/CTA button |
| `showLoginButton` | `boolean` | `false` | Whether to show the login button |
| `bookingHref` | `string` | `"/booking"` | URL for the booking button |
| `loginHref` | `string` | `"/login"` | URL for the login button |
| `bookingText` | `string` | `"Book a Call"` | Text for the booking button |
| `loginText` | `string` | `"Login"` | Text for the login button |
| `backgroundColor` | `string` | `"bg-navy-500"` | Tailwind CSS background color class |

## NavLink Type

```tsx
type NavLink = {
  name: string;
  href: string;
};
```

## Default Navigation Links

If no `navLinks` prop is provided, these default links are used:

```tsx
[
  { name: 'Why Choose Us?', href: '/#why' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'Services', href: '/services' },
  { name: 'Team', href: '/team' },
]
```
