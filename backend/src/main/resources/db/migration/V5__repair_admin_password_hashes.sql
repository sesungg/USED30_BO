UPDATE users
SET password_hash = '$2a$10$PXNaC27qB5Lwlr.SILVEGOeLaeXF5TkDditLH/ydU7izowQtcGqha'
WHERE email IN (
  'super@used30.com',
  'admin@used30.com',
  'inspector@used30.com',
  'settlement@used30.com',
  'cs@used30.com',
  'reviewer@used30.com',
  'store@used30.com',
  'analyst@used30.com'
);
