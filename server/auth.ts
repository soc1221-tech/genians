import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User as SelectUser, loginSchema } from "../shared/schema.js";
import { DEFAULT_ADMIN } from "./firebase.js";

declare global {
  namespace Express {
    interface User extends SelectUser { }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // 기본 admin 계정 확인
          if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
            return done(null, DEFAULT_ADMIN);
          }

          // Firebase에서 사용자 조회
          try {
            const user = await storage.getUserByEmail(email);
            if (!user || !(await comparePasswords(password, user.password))) {
              return done(null, false);
            }
            return done(null, user);
          } catch (dbError) {
            // Firebase가 사용 불가능한 경우, 기본 admin만 허용
            console.log("Firebase not available, using default admin only");
            return done(null, false);
          }
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      // 기본 admin 계정 확인
      if (id === DEFAULT_ADMIN.id) {
        return done(null, DEFAULT_ADMIN);
      }

      // Firebase에서 사용자 조회
      try {
        const user = await storage.getUser(id);
        done(null, user);
      } catch (dbError) {
        // Firebase가 사용 불가능한 경우, 기본 admin만 허용
        if (id === DEFAULT_ADMIN.id) {
          done(null, DEFAULT_ADMIN);
        } else {
          done(dbError);
        }
      }
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ ...user, password: undefined });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ ...req.user, password: undefined });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}
