import { AuthContext } from "../types/base";

export const isNeonAppPreview = () => (window ? window.name === 'neonapp-preview' : false);

export const isValidXML = (xml: string): boolean => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    return !doc.querySelector('parsererror');
  } catch (e) {
    return false;
  }
};

export const validateEditorialAuthContext = (authContext: AuthContext): boolean => {
  if (!authContext || !authContext.editorialAuth) {
    throw new Error(`Could not validate editorial authContext, because editorialAuth is not set`);
  }

  //Clean up the authContext from webAuth
  authContext.webAuth = undefined;

  return true;
};