const bcrypt = require('bcryptjs');
const prisma = require('../../db/prisma');
const { signToken } = require('../../common/jwt');

const BCRYPT_ROUNDS = 10;
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_ROUNDS);

class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

function toPublicUser(user) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

async function register(email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError(409, 'อีเมลนี้ถูกใช้งานแล้ว');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await prisma.user.create({ data: { email, passwordHash } });
  } catch (error) {
    // P2002 = สมัครซ้ำพร้อมกันจนอีเมลชนกัน
    if (error.code === 'P2002') {
      throw new AuthError(409, 'อีเมลนี้ถูกใช้งานแล้ว');
    }
    throw error;
  }

  return { token: signToken(user.id), user: toPublicUser(user) };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(
    password,
    user ? user.passwordHash : DUMMY_HASH
  );

  if (!user || !passwordMatches) {
    throw new AuthError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }

  return { token: signToken(user.id), user: toPublicUser(user) };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toPublicUser(user) : null;
}

module.exports = { AuthError, register, login, getUserById };