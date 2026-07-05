import { Account } from "./types";

/**
 * Seed book of accounts — realistic Global 5000-style enterprise accounts.
 * Edit this list to add/remove default accounts; users can also add their own
 * on the fly from the UI.
 */
export const SEED_ACCOUNTS: Account[] = [
  {
    id: "servicenow",
    name: "ServiceNow",
    industry: "Enterprise Software — IT Service Management",
    headquarters: "Santa Clara, CA, USA",
    domain: "servicenow.com",
  },
  {
    id: "siemens",
    name: "Siemens",
    industry: "Industrial Manufacturing & Automation",
    headquarters: "Munich, Germany",
    domain: "siemens.com",
  },
  {
    id: "bmo",
    name: "BMO Financial Group",
    industry: "Banking & Financial Services",
    headquarters: "Toronto, ON, Canada",
    domain: "bmo.com",
  },
  {
    id: "nationwide",
    name: "Nationwide",
    industry: "Insurance & Financial Services",
    headquarters: "Columbus, OH, USA",
    domain: "nationwide.com",
  },
  {
    id: "first-solar",
    name: "First Solar",
    industry: "Renewable Energy — Solar Manufacturing",
    headquarters: "Tempe, AZ, USA",
    domain: "firstsolar.com",
  },
  {
    id: "maersk",
    name: "A.P. Moller – Maersk",
    industry: "Logistics & Container Shipping",
    headquarters: "Copenhagen, Denmark",
    domain: "maersk.com",
  },
  {
    id: "cvs-health",
    name: "CVS Health",
    industry: "Healthcare & Pharmacy Retail",
    headquarters: "Woonsocket, RI, USA",
    domain: "cvshealth.com",
  },
  {
    id: "unilever",
    name: "Unilever",
    industry: "Consumer Packaged Goods",
    headquarters: "London, United Kingdom",
    domain: "unilever.com",
  },
  {
    id: "schneider-electric",
    name: "Schneider Electric",
    industry: "Energy Management & Automation",
    headquarters: "Rueil-Malmaison, France",
    domain: "se.com",
  },
];
