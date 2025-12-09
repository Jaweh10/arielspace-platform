export default function AdSidebar() {
  return (
    <aside className="hidden lg:block w-80 sticky top-24 h-fit">
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-slate-500 mb-4">ADVERTISEMENT</h3>
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-slate-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">Ad Space</p>
          <p className="text-xs text-slate-400 mt-2">
            Google AdSense will appear here
          </p>
        </div>
      </div>
    </aside>
  );
}
