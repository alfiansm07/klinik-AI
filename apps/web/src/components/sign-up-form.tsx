"use client";

import { useForm } from "@tanstack/react-form";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Pendaftaran berhasil");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Nama minimal 2 karakter"),
        email: z.email("Alamat email tidak valid"),
        password: z.string().min(8, "Password minimal 8 karakter"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
      }}
      initial="hidden"
      animate="show"
    >
      {/* Heading */}
      <motion.div variants={staggerItem} className="mb-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Buat Akun Baru
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftarkan klinik Anda dan mulai kelola lebih efisien
        </p>
      </motion.div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Name */}
        <motion.div variants={staggerItem}>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Nama Lengkap
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Dr. Ahmad Susanto"
                  autoComplete="name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p
                    key={error?.message}
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </motion.div>

        {/* Email */}
        <motion.div variants={staggerItem}>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="nama@klinik.com"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p
                    key={error?.message}
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </motion.div>

        {/* Password */}
        <motion.div variants={staggerItem}>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p
                    key={error?.message}
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </motion.div>

        {/* Submit */}
        <motion.div variants={staggerItem}>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="mt-2 w-full cursor-pointer"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Daftar"}
              </Button>
            )}
          </form.Subscribe>
        </motion.div>
      </form>

      {/* Switch to sign-in */}
      <motion.div variants={staggerItem} className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="cursor-pointer font-medium text-primary underline-offset-4 transition-colors duration-150 hover:underline"
          >
            Masuk
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}
