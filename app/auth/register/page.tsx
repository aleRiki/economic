"use client";
import React from "react";
import { UserPlus, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div style={{ padding: "20px" }}>
      <RegisterForm />
    </div>
  );
}
