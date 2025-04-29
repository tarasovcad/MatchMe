"use client";

import React, {JSX} from "react";
import {toast as sonnerToast} from "sonner";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
type ToastVariant = "success" | "error" | "info" | "warning" | "loading";

interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  button?: {
    label: string;
    onClick: () => void;
  };
  variant: ToastVariant;
}

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toast.title}
      description={toast.description}
      button={{
        label: toast?.button?.label || "",
        onClick: () => console.log("Button clicked"),
      }}
      variant={toast.variant ?? "info"}
    />
  ));
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
  const {title, description, button, id, variant = "info"} = props;

  const styles = {
    warning: {
      bg: "#FEFBE8",
      toastRing: "#F7D5A5",
      imgBg: "#E8B856",
      imgRing: "#F8A118",
      badgeLabel: "Warning",
      insideImageBg: "#FCDDA0",
      insideImageBorder: "#F4B552",
      titleColor: "#180E02",
      secondColor: "#382D1B",
    },
    success: {
      bg: "#ECFDF3",
      toastRing: "#ABEFC6",
      imgBg: "#6CE9A6",
      imgRing: "#12B76A",
      badgeLabel: "Success",
      insideImageBg: "#D1FADF",
      insideImageBorder: "#6CE9A6",
      titleColor: "#054F31",
      secondColor: "#067647",
    },
    error: {
      bg: "#FEF3F2",
      toastRing: "#FDA29B",
      imgBg: "#FDA29B",
      imgRing: "#F04438",
      badgeLabel: "Error",
      insideImageBg: "#FEE4E2",
      insideImageBorder: "#FDA29B",
      titleColor: "#7A271A",
      secondColor: "#B42318",
    },
    info: {
      bg: "#EFF8FF",
      toastRing: "#B2DDFF",
      imgBg: "#84CAFF",
      imgRing: "#2E90FA",
      badgeLabel: "Info",
      insideImageBg: "#D1E9FF",
      insideImageBorder: "#84CAFF",
      titleColor: "#083E87",
      secondColor: "#175CD3",
    },
    loading: {
      bg: "#EFF8FF",
      toastRing: "#B2DDFF",
      imgBg: "#84CAFF",
      imgRing: "#2E90FA",
      badgeLabel: "Pending",
      insideImageBg: "#D1E9FF",
      insideImageBorder: "#84CAFF",
      titleColor: "#083E87",
      secondColor: "#175CD3",
    },
  }[variant];

  const badgeImages: Record<string, JSX.Element> = {
    warning: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10.8652 8.99999L6.86521 1.99999C6.77799 1.84609 6.65151 1.71808 6.49867 1.62902C6.34583 1.53997 6.1721 1.49304 5.99521 1.49304C5.81831 1.49304 5.64459 1.53997 5.49175 1.62902C5.33891 1.71808 5.21243 1.84609 5.12521 1.99999L1.12521 8.99999C1.03705 9.15267 0.990823 9.32594 0.991213 9.50224C0.991604 9.67855 1.0386 9.85162 1.12743 10.0039C1.21627 10.1562 1.34378 10.2823 1.49706 10.3694C1.65033 10.4565 1.82391 10.5016 2.00021 10.5H10.0002C10.1757 10.4998 10.348 10.4535 10.4998 10.3656C10.6517 10.2778 10.7778 10.1515 10.8655 9.99955C10.9531 9.84756 10.9992 9.67518 10.9992 9.49973C10.9991 9.32428 10.9529 9.15193 10.8652 8.99999Z"
          stroke="#1E0F00"
          strokeLinecap="round"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M6 4.5V6.5Z" fill="#1E0F00" />
        <path
          d="M6 4.5V6.5"
          stroke="#1E0F00"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M6 8.5H6.00475Z" fill="#1E0F00" />
        <path
          d="M6 8.5H6.00475"
          stroke="#1E0F00"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    loading: <LoadingButtonCircle size={12} color="#1E0F00" />,
  };

  const getBadgeImage = (variant: string) => badgeImages[variant] || null;

  const getVariantImage = (
    titleColor: string | undefined,
    insideImageBg: string | undefined,
  ): JSX.Element | null => {
    const variants: Record<string, JSX.Element> = {
      warning: (
        <svg
          className="z-10 pb-[2px]"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18.108 15L11.4414 3.33332C11.296 3.07682 11.0852 2.86347 10.8305 2.71504C10.5757 2.56661 10.2862 2.4884 9.99136 2.4884C9.69654 2.4884 9.40699 2.56661 9.15226 2.71504C8.89753 2.86347 8.68673 3.07682 8.54136 3.33332L1.8747 15C1.72777 15.2544 1.65072 15.5432 1.65137 15.8371C1.65202 16.1309 1.73035 16.4194 1.8784 16.6732C2.02646 16.927 2.23899 17.1371 2.49444 17.2823C2.7499 17.4275 3.0392 17.5026 3.33303 17.5H16.6664C16.9588 17.4997 17.246 17.4225 17.4991 17.2761C17.7522 17.1297 17.9624 16.9192 18.1085 16.6659C18.2545 16.4126 18.3314 16.1253 18.3313 15.8329C18.3312 15.5405 18.2542 15.2532 18.108 15Z"
            fill={titleColor}
          />
          <path d="M10 7.5V10.8333V7.5Z" fill={insideImageBg} />
          <path
            d="M10 7.5V10.8333"
            stroke={insideImageBg}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10 14.1666H10.0079H10Z" fill={insideImageBg} />
          <path
            d="M10 14.1666H10.0079"
            stroke={insideImageBg}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    };

    return variants[variant] || null;
  };

  return (
    <div
      className="relative flex items-center gap-[9px] shadow-lg p-[9px] pl-[14px] rounded-[13px] min-[600px]:w-[364px]"
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.toastRing,
        borderWidth: 1,
      }}>
      <div
        className="top-0 left-1/2 z-10 absolute flex items-center gap-[5px] px-2 rounded-full font-medium text-[#180E02] text-[12px] -translate-x-1/2 -translate-y-[11px]"
        style={{
          backgroundColor: styles.imgBg,
          borderColor: styles.toastRing,
        }}>
        {getBadgeImage(variant)}
        {styles.badgeLabel}
      </div>
      <div
        className="relative self-start p-[3px] rounded-[11px] w-9 h-9"
        style={{
          borderWidth: 1,
          borderColor: styles.imgRing,
        }}>
        <div
          className="relative flex justify-center items-center rounded-[11px] w-full h-full overflow-hidden"
          style={{
            borderWidth: 1,
            borderColor: styles.insideImageBorder,
            backgroundColor: styles.insideImageBg,
          }}>
          {/* Lines */}
          <div className="absolute inset-0">
            {/* Vertical Line */}
            <div
              className="top-0 bottom-0 left-1/2 absolute w-[1px] -translate-x-1/2"
              style={{
                backgroundColor: styles.insideImageBorder,
              }}
            />
            {/* Horizontal Line */}
            <div
              className="top-1/2 right-0 left-0 absolute h-[1px] -translate-y-1/2"
              style={{
                backgroundColor: styles.insideImageBorder,
              }}
            />
            {/* Diagonal Line ↘ */}
            <div
              className="top-1/2 left-1/2 absolute w-[140%] h-[1px] rotate-45 -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundColor: styles.insideImageBorder,
              }}
            />
            {/* Diagonal Line ↙ */}
            <div
              className="top-1/2 left-1/2 absolute w-[140%] h-[1px] -rotate-45 -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundColor: styles.insideImageBorder,
              }}
            />
            {/* Circle */}
            <div
              className="top-1/2 left-1/2 absolute rounded-full w-[23px] h-[23px] -translate-x-1/2 -translate-y-1/2"
              style={{
                borderWidth: 1,
                borderColor: styles.insideImageBorder,
              }}
            />
          </div>
          {getVariantImage(styles.titleColor, styles.insideImageBg)}
        </div>
      </div>
      <div className="flex flex-1 items-center">
        <div className="flex flex-col justify-center gap-[3px] w-full">
          <p
            className="font-medium text-sm leading-[14px]"
            style={{
              color: styles.titleColor,
            }}>
            {title}
          </p>
          <p
            className="text-[13px] leading-[15px]"
            style={{
              color: styles.secondColor,
            }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
