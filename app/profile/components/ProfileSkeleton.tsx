import styles from "../profile.module.css";

/** Skeleton used by app/profile/loading.tsx and while the profile data is being fetched. */
export default function ProfileSkeleton() {
  const bone = `${styles.skeleton} rounded-3xl`;
  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-24 pt-4 min-[769px]:max-w-[520px]" role="status" aria-label="กำลังโหลดข้อมูลโปรไฟล์">
      <div className={`${bone} h-[172px]`} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`${styles.skeleton} h-[88px] rounded-2xl`} />)}
      </div>
      <div className={`${bone} mt-5 aspect-[1.75/1] min-h-[190px]`} />
      <div className={`${styles.skeleton} mt-7 h-4 w-24 rounded-full`} />
      <div className={`${bone} mt-3 h-[216px]`} />
      <span className="sr-only">กำลังโหลด…</span>
    </div>
  );
}
