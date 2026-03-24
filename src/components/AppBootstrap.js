"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCustomerMe } from "@/store/thunks/customerAuthThunks";

export default function AppBootstrap({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCustomerMe());
  }, [dispatch]);

  return children;
}