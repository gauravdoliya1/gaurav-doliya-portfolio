export const loginAdmin = (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME || "gauravdoliya";
  const validPassword = process.env.ADMIN_PASSWORD || "gd369";

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  if (username.trim() === validUsername && password === validPassword) {
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        username: validUsername,
        role: "admin"
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid username or password"
  });
};
