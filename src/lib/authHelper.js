import jwt from 'jsonwebtoken';
import { getServiceClient } from './supabaseServer';

const JWT_SECRET = process.env.JWT_SECRET || 'ethiopia_file_index_secret';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function authenticate(req) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return { error: 'No token provided', status: 401 };
  }
  const token = auth.slice(7);
  try {
    const decoded = verifyToken(token);
    const supabase = getServiceClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !user || !user.is_active) {
      return { error: 'Invalid or inactive user', status: 401 };
    }
    return { user };
  } catch {
    return { error: 'Invalid token', status: 401 };
  }
}

export async function requireAdmin(req) {
  const result = await authenticate(req);
  if (result.error) return result;
  if (!['admin', 'superadmin'].includes(result.user.role)) {
    return { error: 'Admin access required', status: 403 };
  }
  return result;
}
