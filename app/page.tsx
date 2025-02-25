import ConferencePage from './conference/page';
import ScoresPage from './scores/page';


export default function HomePage() {
  return (
    <>
      <main className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200 dark:divide-gray-800">
        <ConferencePage />
        <ScoresPage />
      </main>
    </>
  );
}
