/** Build branding payload used on assessment PDF headers/footers. */
export function getAgencyBranding(user) {
  if (!user) {
    return {
      name: '',
      logoUrl: '',
      email: '',
      phone: '',
      fax: '',
      website: '',
      address: '',
      city: '',
      state: '',
    };
  }
  return {
    name: user.agencyName || '',
    logoUrl: user.agencyLogo || '',
    email: user.agencyEmail || '',
    phone: user.agencyPhone || '',
    fax: user.agencyFax || '',
    website: user.agencyWebsite || '',
    address: user.agencyAddress || '',
    city: user.agencyCity || '',
    state: user.agencyState || '',
  };
}

export function formatAgencyStreetLine(branding = {}) {
  const cityState = [branding.city, branding.state].filter(Boolean).join(', ');
  return [branding.address, cityState].filter(Boolean).join(', ');
}
