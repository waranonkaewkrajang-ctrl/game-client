import "../styles/tokens.css";
import styles from "../profile.module.css";

/** Skeleton used by app/profile/loading.tsx and while the profile data is being fetched. Mirrors the real grid. */
export default function ProfileSkeleton() {
  const bone = `${styles.skeleton} rounded-2xl`;
  return (
    <div className={"profile-scope min-h-dvh"}>
      <div
        className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-4 pb-24 pt-4 sm:max-w-[640px] lg:max-w-[1200px]"
        role="status"
        aria-label="กำลังโหลดข้อมูลโปรไฟล์"
      >
        <div className={`${bone} h-[324px] sm:h-[248px] lg:h-[272px]`} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={`${bone} h-[260px]`} />
          <div className={`${bone} h-[260px]`} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className={`${bone} h-[200px] lg:col-span-2`} />
          <div className={`${bone} h-[200px]`} />
        </div>
        <span className="sr-only">กำลังโหลด…</span>
      </div>
    </div>
  );
}
