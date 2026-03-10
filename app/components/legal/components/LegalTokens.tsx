import React from "react";
import { LEGAL } from "../lib/constants";

export function BusinessEmailLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={`mailto:${LEGAL.businessEmail}`} {...props}>
      {LEGAL.businessEmail}
    </a>
  );
}

export function BusinessPhone() {
  return <>{LEGAL.phone}</>;
}

export function LegalCompanyName() {
  return <>{LEGAL.companyLegalName}</>;
}

export function DBAName() {
  return <>{LEGAL.dbaName}</>;
}

export function BusinessAddressBlock() {
  const a = LEGAL.address;
  return (
    <>
      <p><LegalCompanyName /></p>
      <p><DBAName /></p>
      <p>{a.line1}</p>
      <p>
        {a.city}, {a.state} {a.zip}
      </p>
      <p>{a.country}</p>
    </>
  );
}