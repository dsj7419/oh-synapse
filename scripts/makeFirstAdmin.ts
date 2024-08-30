import { db } from "@/server/db";

const makeFirstAdmin = async () => {
  const YOUR_EMAIL = "globalaspect1@gmail.com";

  try {
    const updatedUser = await db.user.update({
      where: { email: YOUR_EMAIL },
      data: { role: 'admin' },
    });
//    console.log('User updated to admin:', updatedUser);
  } catch (error) {
    console.error('Error updating user to admin:', error);
  }
};

makeFirstAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });