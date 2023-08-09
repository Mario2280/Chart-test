import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import('./dynamicChart'), {
  ssr: false, 
});
export default function Page() {
  return (
    <div>
      <DynamicChart />
    </div>
  );
}