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
