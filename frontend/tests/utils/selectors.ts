export const SELECTORS = {
  username:  { byLabel: /username/i },
  password:  { byLabel: /password/i },
  signInBtn: { byRole: { role: 'button', name: /sign in/i } },

  // Landings (fallbacks; test will prefer env overrides)
  userLandingText: /new chat|channels|chat/i,
  adminLandingText: /admin dashboard|users|teams|settings/i,
};