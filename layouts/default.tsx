import React from "react";

import Link from "next/link";

import Button from "components/elements/button";

import classes from "clsx";
import { useAuth } from "hooks/use-auth";

function Layout({
  className,
  children: _children,
  ...props
}: JSX.IntrinsicElements["main"]) {
  const auth = useAuth();

  const children = React.Children.toArray(_children);

  const header = children.filter((child: any) => child.type === Layout.Header);
  const footer = children.filter((child: any) => child.type === Layout.Footer);
  const main = children.filter(
    (child: any) => ![Layout.Header, Layout.Footer].includes(child.type)
  );

  return (
    <div className="flex flex-col w-screen min-h-screen pt-32 font-mono">
      <header className="flex items-center justify-between h-16 px-8 md:px-16">
        <span className="text-xl tracking-wider">The Washing Company</span>

        <div className="flex items-center space-x-4">
          {auth.user && (
            <>
              <Link href="/dashboard" passHref>
                <Button outline>Dashboard</Button>
              </Link>

              <Link href="/washes" passHref>
                <Button outline>Washes</Button>
              </Link>

              <Link href="/accounts" passHref>
                <Button outline>Accounts</Button>
              </Link>

              <Link href="/profile" passHref>
                <Button outline>Profile</Button>
              </Link>

              <Button onClick={() => auth.logout()} outline>
                Logout
              </Button>
            </>
          )}

          {header.map((element, i) => (
            <React.Fragment key={i}>{element}</React.Fragment>
          ))}
        </div>
      </header>

      <main
        className={classes("flex flex-grow px-8 md:px-16", className)}
        {...props}
      >
        {main.map((element, i) => (
          <React.Fragment key={i}>{element}</React.Fragment>
        ))}
      </main>

      <footer className="flex items-center justify-between h-12 px-8 md:px-16">
        <span>&copy; {new Date().getFullYear()} The Washing Company</span>

        <div className="flex items-center space-x-4">
          {footer.map((element, i) => (
            <React.Fragment key={i}>{element}</React.Fragment>
          ))}
        </div>
      </footer>
    </div>
  );
}

Layout.Header = function Header({ children }) {
  return <>{children}</>;
};

Layout.Footer = function Footer({ children }) {
  return <>{children}</>;
};

export default Layout;
