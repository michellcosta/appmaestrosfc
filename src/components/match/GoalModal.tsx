// ===============================
<option key={p.id} value={p.id}>
{p.name}
</option>
))}
</select>


<label className="block text-sm font-medium mt-2">Minuto</label>
<div className="flex items-center gap-2">
<Timer className="h-4 w-4" />
<input
type="number"
min={0}
inputMode="numeric"
className="flex-1 rounded-xl border p-3"
value={minute}
onChange={(e) => setMinute(Math.max(0, Number(e.target.value)))}
/>
<span className="text-sm text-muted-foreground">min</span>
</div>


<label className="mt-2 inline-flex items-center gap-2 text-sm">
<input type="checkbox" checked={isOwnGoal} onChange={(e) => setIsOwnGoal(e.target.checked)} />
Gol contra
</label>


<div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
<Trophy className="h-4 w-4" />
Dica: toque no jogador para definir o autor do gol e registre o minuto aproximado.
</div>
</div>
</ActionSheet>
);
}
