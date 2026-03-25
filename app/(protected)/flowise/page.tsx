export default function FlowisePage() {
  return (
    <div className="-mx-4 -mb-8 flex flex-1 flex-col">
      <iframe
        src="/api/proxy/flowise/"
        className="flex-1 border-0"
        style={{ minHeight: "calc(100vh - 65px)" }}
        title="Flowise Agent Builder"
      />
    </div>
  );
}
