import crypto from "crypto";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { UserRole } from "../utils/constants";
import { config } from "../config";

const hashResetToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export class AuthService {
  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    console.log("password-->", password);

    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated");
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  static async register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw ApiError.conflict("Email already registered");

    const user = await User.create({ name, email, password, role });
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
 
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async forgotPassword(email: string) {
    const normalized = email.toLowerCase();
    const user = await User.findOne({ email: normalized }).select(
      "+passwordResetToken +passwordResetExpires",
    );

    const message =
      "If an account exists for this email, password reset instructions have been sent.";

    if (!user || !user.isActive) {
      return { message };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashResetToken(rawToken);
    user.passwordResetExpires = new Date(
      Date.now() + config.passwordResetExpireMinutes * 60 * 1000,
    );
    console.log("user.passwordResetToken-->", user.passwordResetToken);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${config.frontendUrl}/reset-password?token=${rawToken}`;

    return {
      message,
      ...(config.env === "development" && {
        resetUrl,
        expiresInMinutes: config.passwordResetExpireMinutes,
      }),
    };
  }

  static async resetPassword(token: string, password: string) {
    const user = await User.findOne({
      passwordResetToken: hashResetToken(token),
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }
    console.log("user.passwordResetToken-->", user.passwordResetToken);

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return {
      message:
        "Password reset successful. You can sign in with your new password.",
    };
  }
}
