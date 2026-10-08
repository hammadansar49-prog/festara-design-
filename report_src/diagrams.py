import sys, os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Ellipse, Rectangle, Circle, FancyArrowPatch, Polygon

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
plt.rcParams["font.family"] = "Times New Roman"
# BRAND=1 swaps in the Festara palette (brand/tokens.css). Default output is unchanged.
_P = (dict(INK="#1C1A22", FILL="#EFE9DD", ACC="#DDE7D2", ADM="#F9E2B8", PANEL="#FBF8F2", PANEL2="#FCFAF5",
           NODE="#E6DFD0", KEY="#6E4A2B", DONE="#4C6B35", TODO="#E6E0D6", MILE="#A85410")
      if os.environ.get("BRAND") == "1" else
      dict(INK="#1f2937", FILL="#eef2f9", ACC="#dbe6f5", ADM="#fde9c8", PANEL="#f7f9fc", PANEL2="#fafbfd",
           NODE="#e5eaf3", KEY="#7a3b00", DONE="#3b5b92", TODO="#c9d4e6", MILE="#b45309"))
INK, FILL, ACC, ADM = _P["INK"], _P["FILL"], _P["ACC"], _P["ADM"]
PANEL, PANEL2, NODE, KEY, DONE, TODO, MILE = (_P[k] for k in ("PANEL", "PANEL2", "NODE", "KEY", "DONE", "TODO", "MILE"))


def canvas(w, h):
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    ax.set_xlim(0, w * 10); ax.set_ylim(0, h * 10); ax.axis("off")
    return fig, ax


def save(fig, name):
    fig.savefig(os.path.join(OUT, name + ".png"), bbox_inches="tight", pad_inches=0.1, facecolor="white")
    plt.close(fig)


def box(ax, x, y, w, h, text, fc=FILL, fs=10, bold=False, rounded=True, ec=INK, lw=1.2, align="center"):
    style = "round,pad=0.02,rounding_size=1.2" if rounded else "square,pad=0"
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=style, fc=fc, ec=ec, lw=lw))
    ax.text(x + w / 2 if align == "center" else x + 1, y + h / 2, text, ha=align, va="center", fontsize=fs,
            fontweight="bold" if bold else "normal", color=INK, wrap=True)
    return (x, y, w, h)


def arrow(ax, p1, p2, text=None, fs=8, style="-|>", ls="-", off=(0, 1.2), color=INK, rad=0):
    ax.add_patch(FancyArrowPatch(p1, p2, arrowstyle=style, mutation_scale=12, lw=1.1, color=color,
                                 linestyle=ls, connectionstyle=f"arc3,rad={rad}"))
    if text:
        mx, my = (p1[0] + p2[0]) / 2 + off[0], (p1[1] + p2[1]) / 2 + off[1]
        ax.text(mx, my, text, ha="center", va="center", fontsize=fs, color=INK,
                bbox=dict(fc="white", ec="none", pad=0.6))


def actor(ax, x, y, name, s=1.0):
    ax.add_patch(Circle((x, y + 6 * s), 1.6 * s, fc="white", ec=INK, lw=1.2))
    ax.plot([x, x], [y + 4.4 * s, y + 0.5 * s], color=INK, lw=1.2)
    ax.plot([x - 2.4 * s, x + 2.4 * s], [y + 3.2 * s, y + 3.2 * s], color=INK, lw=1.2)
    ax.plot([x, x - 2 * s], [y + 0.5 * s, y - 2.5 * s], color=INK, lw=1.2)
    ax.plot([x, x + 2 * s], [y + 0.5 * s, y - 2.5 * s], color=INK, lw=1.2)
    ax.text(x, y - 4.5 * s, name, ha="center", va="center", fontsize=10, fontweight="bold")


def uc(ax, x, y, text, w=24, h=6, fc=FILL):
    ax.add_patch(Ellipse((x, y), w, h, fc=fc, ec=INK, lw=1.1))
    ax.text(x, y, text, ha="center", va="center", fontsize=8.5)
    return (x, y, w, h)


# ---------------------------------------------------------------- 1.1 Process model (Scrum)
def scrum():
    fig, ax = canvas(10.5, 4.2)
    items = [("Product\nBacklog", 2), ("Sprint\nPlanning", 19), ("Sprint Backlog", 36), ("2-Week Sprint\n(Design, Code, Test)", 55),
             ("Sprint Review\n& Supervisor Demo", 76)]
    for t, x in items:
        box(ax, x, 15, 15 if x != 55 else 17, 12, t, fs=9.5)
    for i in range(len(items) - 1):
        x1 = items[i][1] + (15 if items[i][1] != 55 else 17); x2 = items[i + 1][1]
        arrow(ax, (x1, 21), (x2, 21))
    box(ax, 55, 32, 17, 7, "Daily stand-up\n(WhatsApp / meet)", fc=ACC, fs=8.5)
    arrow(ax, (63.5, 32), (63.5, 27.2), style="<|-|>")
    box(ax, 76, 1, 15, 8, "Retrospective", fc=ACC, fs=9)
    arrow(ax, (83.5, 15), (83.5, 9.2))
    arrow(ax, (76, 5), (9.5, 14.8), text="Feedback and new items return to the backlog", rad=-0.0, fs=8.5, off=(0, -2.2))
    box(ax, 94, 15, 9, 12, "Increment\n(deployed\nto Vercel)", fc=ADM, fs=8)
    arrow(ax, (91, 21), (94, 21))
    save(fig, "fig1_1_scrum")


# ---------------------------------------------------------------- 3.1 Use case
def usecase():
    fig, ax = canvas(10, 9.5)
    ax.add_patch(Rectangle((22, 3), 56, 89, fc="white", ec=INK, lw=1.3))
    ax.text(50, 89.5, "Festara System", ha="center", fontsize=12, fontweight="bold")
    left = [("Register / Login", 84), ("Manage Profile", 77), ("Create Event", 70), ("Edit / Delete Event", 63),
            ("Generate Invite Link", 56), ("Manage Member Roles", 49), ("Set / Edit Budget", 42),
            ("Create / Assign Task", 35), ("View Admin Dashboard", 28), ("Generate AI Checklist*", 21), ("Get AI Budget Estimate*", 14)]
    right = [("View My Events", 77), ("Join Event via Link", 70), ("Add / Filter Guests", 63), ("Log Expense", 56),
             ("Update Task Status", 49), ("Confirm RSVP", 16), ("View Event Details", 9)]
    P = {}
    for t, y in left: P[t] = uc(ax, 38, y, t)
    for t, y in right: P[t] = uc(ax, 63, y, t)
    actor(ax, 8, 62, "Admin"); actor(ax, 92, 52, "Member"); actor(ax, 92, 12, "Guest")
    for t, _ in left:
        arrow(ax, (10.5, 63), (P[t][0] - 12, P[t][1]), style="-", color="#555")
    ax.text(8, 50, "Admin also performs\nall Member use cases", ha="center", fontsize=7.5, style="italic")
    for t in ["View My Events", "Join Event via Link", "Add / Filter Guests", "Log Expense", "Update Task Status"]:
        arrow(ax, (89.5, 53), (P[t][0] + 12, P[t][1]), style="-", color="#555")
    for t in ["Confirm RSVP", "View Event Details"]:
        arrow(ax, (89.5, 13), (P[t][0] + 12, P[t][1]), style="-", color="#555")
    ax.text(50, 0.2, "* Phase 2 (AI Features Module)", ha="center", fontsize=8.5, style="italic")
    save(fig, "fig3_1_usecase")


# ---------------------------------------------------------------- 4.1 Architecture
def architecture():
    fig, ax = canvas(10, 6)
    box(ax, 2, 44, 22, 12, "Client\n(Desktop / Mobile Browser)", fs=10, bold=True)
    ax.add_patch(Rectangle((32, 4), 34, 55, fc=PANEL, ec=INK, lw=1.2, ls="--"))
    ax.text(49, 56, "Vercel (Hosting)", ha="center", fontsize=10, fontweight="bold")
    box(ax, 35, 41, 28, 11, "Next.js 16 App Router\nReact Server & Client Components\nTailwind CSS", fs=8.5)
    box(ax, 35, 26, 28, 10, "Server Actions / Route Handlers\n(validation, role checks)", fs=8.5)
    box(ax, 35, 8, 28, 12, "AI Route (Phase 2)\nVercel AI SDK streaming", fs=8.5, fc=ADM)
    ax.add_patch(Rectangle((72, 14), 26, 45, fc=PANEL, ec=INK, lw=1.2, ls="--"))
    ax.text(85, 56, "Supabase (BaaS)", ha="center", fontsize=10, fontweight="bold")
    box(ax, 74, 44, 22, 8, "Supabase Auth\n(JWT sessions)", fs=8.5)
    box(ax, 74, 31, 22, 9, "PostgreSQL\n+ Row Level Security", fs=8.5)
    box(ax, 74, 17, 22, 9, "Realtime\n(change subscriptions)", fs=8.5)
    box(ax, 74, 1, 22, 9, "OpenAI API\n(Phase 2)", fs=8.5, fc=ADM)
    arrow(ax, (24, 50), (35, 47), "HTTPS")
    arrow(ax, (49, 41), (49, 36.2))
    arrow(ax, (63, 31), (74, 35), "SQL via\nsupabase-js")
    arrow(ax, (63, 47), (74, 48), "auth")
    ax.plot([74, 69, 69, 13, 13], [21, 21, 1.5, 1.5, 40], color=INK, ls="--", lw=1.1)
    arrow(ax, (13, 40), (13, 43.8), ls="--")
    ax.text(40, 1.5, "realtime updates (WebSocket)", ha="center", va="center", fontsize=8, bbox=dict(fc="white", ec="none", pad=0.6))
    arrow(ax, (63, 13), (74, 6), "prompt / JSON")
    save(fig, "fig4_1_architecture")


# ---------------------------------------------------------------- DFD L0
def dfd0():
    fig, ax = canvas(10, 5.5)
    ax.add_patch(Circle((50, 28), 13, fc=ACC, ec=INK, lw=1.4))
    ax.text(50, 28, "0\nFestara\nEvent Planning\nSystem", ha="center", va="center", fontsize=10, fontweight="bold")
    box(ax, 2, 44, 18, 8, "Admin", rounded=False, bold=True)
    box(ax, 2, 6, 18, 8, "Member", rounded=False, bold=True)
    box(ax, 80, 44, 18, 8, "Guest", rounded=False, bold=True)
    box(ax, 80, 6, 18, 8, "OpenAI API", rounded=False, bold=True, fc=ADM)
    arrow(ax, (20, 50), (39, 36), "event details, budget,\nrole changes, invites", off=(-3, 4))
    arrow(ax, (40, 33), (20, 46), "dashboard, reports", off=(2, -4))
    arrow(ax, (20, 12), (39, 21), "guests, expenses,\ntask updates", off=(-4, -4))
    arrow(ax, (40, 19), (20, 9), "event data, my tasks", off=(4, -4))
    arrow(ax, (80, 48), (62, 34), "RSVP response", off=(3, 3))
    arrow(ax, (61, 31), (80, 45), "invite link, event info", off=(5, -1))
    arrow(ax, (61, 22), (80, 11), "prompt (Phase 2)", off=(4, 3))
    arrow(ax, (80, 8), (60, 19), "checklist / estimate", off=(2, -4))
    save(fig, "fig4_2_dfd0")


# ---------------------------------------------------------------- DFD L1
def dfd1():
    fig, ax = canvas(10, 8)
    def proc(x, y, n, t):
        ax.add_patch(FancyBboxPatch((x, y), 18, 10, boxstyle="round,pad=0.02,rounding_size=2.5", fc=ACC, ec=INK, lw=1.2))
        ax.plot([x, x + 18], [y + 7, y + 7], color=INK, lw=0.8)
        ax.text(x + 9, y + 8.5, n, ha="center", va="center", fontsize=8, fontweight="bold")
        ax.text(x + 9, y + 3.5, t, ha="center", va="center", fontsize=8.5)
    def store(x, y, n, t):
        ax.add_patch(Rectangle((x, y), 20, 5, fc="white", ec=INK, lw=1.1))
        ax.plot([x + 4, x + 4], [y, y + 5], color=INK, lw=1.1)
        ax.text(x + 2, y + 2.5, n, ha="center", va="center", fontsize=8)
        ax.text(x + 12, y + 2.5, t, ha="center", va="center", fontsize=8.5)
    box(ax, 1, 66, 13, 7, "Admin", rounded=False, bold=True)
    box(ax, 1, 12, 13, 7, "Member", rounded=False, bold=True)
    box(ax, 86, 43, 13, 7, "Guest", rounded=False, bold=True)
    proc(24, 64, "1.0", "Authenticate\nUser"); proc(56, 64, "2.0", "Manage\nEvent")
    proc(24, 40, "3.0", "Manage Roles\n& Invites"); proc(56, 40, "4.0", "Manage Guests\n& RSVP")
    proc(24, 14, "5.0", "Track Expenses\n& Budget"); proc(56, 14, "6.0", "Manage\nTasks")
    store(40, 55, "D1", "profiles"); store(76, 55, "D2", "events")
    store(2, 31, "D3", "event_members"); store(78, 31, "D4", "guests")
    store(40, 2, "D5", "expenses"); store(78, 2, "D6", "tasks")
    arrow(ax, (14, 70), (24, 70), "credentials", off=(0, 2))
    arrow(ax, (42, 69), (56, 69), "session", off=(0, 2))
    arrow(ax, (33, 64), (42, 60.2), off=(0, 0)); arrow(ax, (65, 64), (80, 60.2))
    arrow(ax, (7, 66), (24, 47), "invite / role", off=(-3, 0))
    arrow(ax, (24, 42), (14, 36.2)); arrow(ax, (86, 46.5), (74.2, 46.5), "RSVP", off=(0, 2))
    arrow(ax, (74, 42), (84, 36.2)); arrow(ax, (14, 17), (24, 18), "expense", off=(0, 2))
    arrow(ax, (33, 14), (45, 7.2)); arrow(ax, (14, 14), (56, 17), "status update", off=(10, -3), rad=0.15)
    arrow(ax, (70, 14), (84, 7.2)); arrow(ax, (42, 45), (56, 45), "member list", off=(0, 2))
    arrow(ax, (33, 40), (33, 24.2), "role check", off=(-5, 0)); arrow(ax, (65, 40), (65, 24.2), "role check", off=(5, 0))
    save(fig, "fig4_3_dfd1")


# ---------------------------------------------------------------- Class diagram
def cls(ax, x, y, w, name, attrs, ops, fc=FILL):
    lh = 2.6
    h1, h2, h3 = 4, len(attrs) * lh + 1, len(ops) * lh + 1
    top = y
    ax.add_patch(Rectangle((x, top - h1), w, h1, fc=ACC, ec=INK, lw=1.1))
    ax.text(x + w / 2, top - h1 / 2, name, ha="center", va="center", fontsize=9, fontweight="bold")
    ax.add_patch(Rectangle((x, top - h1 - h2), w, h2, fc="white", ec=INK, lw=1.1))
    for i, a in enumerate(attrs): ax.text(x + 0.8, top - h1 - 1.7 - i * lh, a, fontsize=7.5, va="center")
    ax.add_patch(Rectangle((x, top - h1 - h2 - h3), w, h3, fc="white", ec=INK, lw=1.1))
    for i, o in enumerate(ops): ax.text(x + 0.8, top - h1 - h2 - 1.7 - i * lh, o, fontsize=7.5, va="center")
    return (x, top - h1 - h2 - h3, w, h1 + h2 + h3)


def classdiag():
    fig, ax = canvas(11, 10)
    U = cls(ax, 2, 98, 27, "User", ["- id: UUID", "- email: string", "- fullName: string", "- phone: string"],
            ["+ register()", "+ login()", "+ resetPassword()", "+ updateProfile()"])
    E = cls(ax, 41, 98, 28, "Event", ["- id: UUID", "- name: string", "- type: EventType", "- eventDate: Date",
                                       "- location: string", "- totalBudget: decimal"],
            ["+ create()", "+ update()", "+ delete()", "+ daysRemaining(): int"])
    M = cls(ax, 81, 98, 27, "EventMember", ["- eventId: UUID", "- userId: UUID", "- role: Role", "- joinedAt: Date"],
            ["+ changeRole(r: Role)", "+ remove()", "+ can(action): bool"])
    I = cls(ax, 81, 58, 27, "Invitation", ["- token: string", "- role: Role", "- expiresAt: Date"],
            ["+ generate()", "+ accept(user)", "+ isValid(): bool"])
    G = cls(ax, 2, 50, 22, "Guest", ["- name: string", "- phone: string", "- familySide: string", "- rsvp: RSVPStatus"],
            ["+ add()", "+ updateRSVP()"])
    X = cls(ax, 26, 50, 22, "Expense", ["- amount: decimal", "- category: Category", "- description: string", "- date: Date"],
            ["+ log()", "+ edit()"])
    T = cls(ax, 50, 50, 22, "Task", ["- title: string", "- assignee: UUID", "- deadline: Date", "- status: TaskStatus"],
            ["+ create()", "+ setStatus()"])
    A = cls(ax, 81, 33, 27, "ActivityLog", ["- actorId: UUID", "- action: string", "- createdAt: Date"], ["+ record()"])
    B = cls(ax, 22, 23, 30, "BudgetSummary", ["- totalBudget: decimal", "- totalSpent: decimal"],
            ["+ remaining(): decimal", "+ usagePercent(): float", "+ isOverThreshold(): bool"], )
    arrow(ax, (29, 90), (41, 90), "1        creates        *", style="-")
    arrow(ax, (69, 90), (81, 90), "1               *", style="-")
    arrow(ax, (94, 72), (94, 58), "1   issues   *", style="-")
    arrow(ax, (47, 70.6), (13, 50), "1..*", style="-")
    arrow(ax, (53, 70.6), (37, 50), "1..*", style="-")
    arrow(ax, (60, 70.6), (61, 50), "1..*", style="-")
    arrow(ax, (69, 72), (81, 26), "logs", style="-", ls="--")
    arrow(ax, (37, 28.4), (37, 23), "aggregates", style="-", ls="--", off=(6, 0))
    ax.text(83, 6, "«enumeration»\nRole: ADMIN | MEMBER | GUEST\nRSVPStatus: PENDING | CONFIRMED | DECLINED\n"
            "TaskStatus: TODO | IN_PROGRESS | DONE\nCategory: VENUE | CATERING | DECOR |\nTRANSPORT | PHOTOGRAPHY | MISC",
            ha="center", fontsize=7.5, bbox=dict(fc=PANEL, ec=INK, lw=0.8, pad=4))
    save(fig, "fig4_4_class")


# ---------------------------------------------------------------- Activity diagram
def activity():
    fig, ax = canvas(8, 11)
    ax.add_patch(Circle((40, 106), 1.6, fc=INK))
    steps = [(97, "Open Festara and log in"), (88, "Click \"Create Event\""),
             (79, "Enter name, type, date, location, budget")]
    for y, t in steps: box(ax, 22, y, 36, 6, t, fs=9)
    arrow(ax, (40, 104.4), (40, 103.2)); arrow(ax, (40, 97), (40, 94.2)); arrow(ax, (40, 88), (40, 85.2))
    ax.add_patch(Polygon([(40, 76), (47, 71), (40, 66), (33, 71)], fc="white", ec=INK, lw=1.1))
    ax.text(40, 71, "valid?", ha="center", va="center", fontsize=8.5)
    arrow(ax, (40, 79), (40, 76.2))
    box(ax, 60, 68, 18, 6, "Show field errors", fs=8.5)
    arrow(ax, (47, 71), (60, 71), "no", off=(0, 1.5)); arrow(ax, (69, 74), (58, 82), rad=0.3)
    box(ax, 22, 56, 36, 6, "Save event; creator added as ADMIN", fs=9)
    arrow(ax, (40, 66), (40, 62.2), "yes", off=(3, 0))
    box(ax, 22, 46, 36, 6, "Generate invite link with role", fs=9)
    arrow(ax, (40, 56), (40, 52.2))
    box(ax, 22, 36, 36, 6, "Share link (WhatsApp / copy)", fs=9)
    arrow(ax, (40, 46), (40, 42.2))
    box(ax, 22, 26, 36, 6, "Invitee opens link and logs in", fs=9)
    arrow(ax, (40, 36), (40, 32.2))
    ax.add_patch(Polygon([(40, 23), (47, 18), (40, 13), (33, 18)], fc="white", ec=INK, lw=1.1))
    ax.text(40, 18, "token\nvalid?", ha="center", va="center", fontsize=8)
    arrow(ax, (40, 26), (40, 23.2))
    box(ax, 60, 15, 18, 6, "Show \"link expired\"", fs=8.5)
    arrow(ax, (47, 18), (60, 18), "no", off=(0, 1.5))
    box(ax, 22, 3, 36, 6, "Add to event_members with role", fs=9)
    arrow(ax, (40, 13), (40, 9.2), "yes", off=(3, 0))
    ax.add_patch(Circle((40, 0), 1.8, fc="white", ec=INK, lw=1.2)); ax.add_patch(Circle((40, 0), 1.1, fc=INK))
    arrow(ax, (40, 3), (40, 1.9)); arrow(ax, (69, 15), (41.8, 0.3), rad=-0.2)
    save(fig, "fig4_5_activity")


# ---------------------------------------------------------------- Sequence diagram
def sequence():
    fig, ax = canvas(11, 8)
    parts = [(8, "Invitee"), (30, "Browser\n(Next.js UI)"), (54, "Server Action"), (78, "Supabase Auth"), (100, "PostgreSQL\n(RLS)")]
    for x, t in parts:
        box(ax, x - 8, 72, 16, 7, t, fs=8.5, bold=True)
        ax.plot([x, x], [5, 72], color="#777", ls="--", lw=0.9)
    actor(ax, 8, 83, "")
    msgs = [(8, 30, 66, "1: open /invite/[token]"), (30, 54, 61, "2: acceptInvite(token)"),
            (54, 78, 56, "3: getUser()"), (78, 54, 51, "4: user (JWT)", True),
            (54, 100, 46, "5: select invitation where token"), (100, 54, 41, "6: invitation {event, role, expiresAt}", True),
            (54, 54, 36, "7: validate expiry"), (54, 100, 31, "8: insert event_members(user, role)"),
            (100, 54, 26, "9: ok (RLS policy passed)", True), (54, 30, 21, "10: redirect /events/[id]", True),
            (30, 8, 16, "11: event dashboard for role", True)]
    for m in msgs:
        x1, x2, y, t = m[:4]; ret = len(m) > 4
        if x1 == x2:
            ax.add_patch(FancyArrowPatch((x1, y + 1), (x1, y - 2), connectionstyle="arc3,rad=-1.6", arrowstyle="-|>",
                                         mutation_scale=10, color=INK, lw=1))
            ax.text(x1 + 6, y, t, fontsize=8, va="center")
            continue
        arrow(ax, (x1, y), (x2, y), t, ls="--" if ret else "-", off=(0, 1.5), fs=8)
    for x, y0, y1 in [(30, 14, 68), (54, 19, 63), (78, 49, 58), (100, 24, 48)]:
        ax.add_patch(Rectangle((x - 0.8, y0), 1.6, y1 - y0, fc="white", ec=INK, lw=0.9, zorder=3))
    save(fig, "fig4_6_sequence")


# ---------------------------------------------------------------- State diagram (Task)
def state():
    fig, ax = canvas(10, 3.6)
    ax.add_patch(Circle((4, 18), 1.6, fc=INK))
    for x, t in [(14, "To Do"), (42, "In Progress"), (72, "Done")]:
        box(ax, x, 13, 18, 10, t, fs=10, bold=True)
    arrow(ax, (5.6, 18), (14, 18), "created", off=(0, 2))
    arrow(ax, (32, 20), (42, 20), "member starts", off=(0, 2))
    arrow(ax, (42, 16), (32, 16), "paused", off=(0, -2))
    arrow(ax, (60, 18), (72, 18), "completed", off=(0, 2))
    arrow(ax, (81, 13), (23, 13), "reopened by Admin", rad=-0.35, off=(0, -10))
    ax.add_patch(Circle((97, 18), 1.8, fc="white", ec=INK)); ax.add_patch(Circle((97, 18), 1.1, fc=INK))
    arrow(ax, (90, 18), (95.2, 18), "event closed", off=(0, 3))
    save(fig, "fig4_7_state")


# ---------------------------------------------------------------- Component diagram
def component():
    fig, ax = canvas(10, 6)
    def comp(x, y, w, h, t, fc=FILL):
        box(ax, x, y, w, h, t, rounded=False, fs=8.5, fc=fc)
        ax.add_patch(Rectangle((x + w - 4, y + h - 3.2), 3, 2.2, fc="white", ec=INK, lw=0.8))
        ax.add_patch(Rectangle((x + w - 4.6, y + h - 2.8), 1.2, 0.5, fc="white", ec=INK, lw=0.6))
        ax.add_patch(Rectangle((x + w - 4.6, y + h - 1.9), 1.2, 0.5, fc="white", ec=INK, lw=0.6))
    ax.add_patch(Rectangle((1, 3), 64, 54, fc=PANEL2, ec=INK, ls="--"))
    ax.text(33, 54.5, "Next.js Web Application", ha="center", fontsize=10, fontweight="bold")
    mods = [("Auth UI\n(/login, /register)", 3, 40), ("Events UI\n(/events)", 24, 40), ("Members & Invites\nUI", 45, 40),
            ("Guests & RSVP\nUI", 3, 26), ("Expenses &\nBudget UI", 24, 26), ("Tasks UI", 45, 26)]
    for t, x, y in mods: comp(x, y, 18, 10, t)
    comp(3, 6, 39, 12, "lib/ : supabase client, role guard (can()),\nzod validation schemas, server actions", fc=ACC)
    comp(45, 6, 18, 12, "AI Module\n(Phase 2)", fc=ADM)
    comp(74, 36, 24, 14, "Supabase Auth")
    comp(74, 16, 24, 14, "Supabase Database\n(PostgreSQL + RLS)")
    comp(74, 1, 24, 9, "OpenAI API", fc=ADM)
    arrow(ax, (33, 26), (25, 18.2), "uses", off=(3, 0))
    arrow(ax, (65, 23), (74, 23), "supabase-js", off=(0, 2)); arrow(ax, (65, 43), (74, 43), "auth API", off=(0, 2))
    arrow(ax, (63, 9), (74, 5), "AI SDK")
    save(fig, "fig4_8_component")


# ---------------------------------------------------------------- Deployment diagram
def deployment():
    fig, ax = canvas(10, 4.8)
    def node(x, y, w, h, t, inner):
        ax.add_patch(Polygon([(x, y + h), (x + 3, y + h + 3), (x + w + 3, y + h + 3), (x + w + 3, y + 3), (x + w, y)],
                             fc=NODE, ec=INK, lw=1))
        ax.add_patch(Rectangle((x, y), w, h, fc="white", ec=INK, lw=1.2))
        ax.text(x + w / 2, y + h - 3, t, ha="center", fontsize=9.5, fontweight="bold")
        for i, s in enumerate(inner):
            box(ax, x + 2, y + h - 11 - i * 7.5, w - 4, 6, s, fs=8, rounded=False)
    node(1, 8, 24, 30, "«device»\nUser Browser", ["Chrome / Safari / Edge", "Festara UI bundle"])
    node(35, 8, 25, 30, "«cloud» Vercel Edge\nand Serverless", ["Next.js 16 build", "Server Actions (Node 18+)"])
    node(69, 8, 25, 30, "«cloud» Supabase\n(managed)", ["PostgreSQL + RLS", "Auth + Realtime"])
    arrow(ax, (25, 23), (35, 23), "HTTPS / TLS", style="<|-|>", off=(0, 2.2))
    arrow(ax, (60, 23), (69, 23), "HTTPS / WSS", style="<|-|>", off=(0, 2.2))
    save(fig, "fig4_9_deployment")


# ---------------------------------------------------------------- ERD
def ent(ax, x, y, w, name, cols):
    lh = 2.5; h = 4 + len(cols) * lh + 0.8
    ax.add_patch(Rectangle((x, y - 4), w, 4, fc=ACC, ec=INK, lw=1.1))
    ax.text(x + w / 2, y - 2, name, ha="center", va="center", fontsize=9, fontweight="bold")
    ax.add_patch(Rectangle((x, y - h), w, h - 4, fc="white", ec=INK, lw=1.1))
    for i, (k, c) in enumerate(cols):
        ax.text(x + 0.8, y - 5.6 - i * lh, k, fontsize=7, fontweight="bold", va="center", color=KEY)
        ax.text(x + 4.6, y - 5.6 - i * lh, c, fontsize=7.5, va="center")
    return (x, y - h, w, h)


def erd():
    fig, ax = canvas(13, 7.6)
    P = ent(ax, 2, 74, 24, "profiles", [("PK", "id (uuid, = auth.users.id)"), ("", "full_name"), ("", "phone"), ("", "avatar_url"), ("", "created_at")])
    E = ent(ax, 52, 74, 26, "events", [("PK", "id (uuid)"), ("", "name"), ("", "type (enum)"), ("", "event_date"), ("", "location"),
                                      ("", "description"), ("", "total_budget (numeric)"), ("FK", "created_by → profiles"), ("", "created_at")])
    I = ent(ax, 104, 74, 24, "invitations", [("PK", "id"), ("FK", "event_id → events"), ("UQ", "token"), ("", "role"),
                                           ("FK", "created_by → profiles"), ("", "expires_at"), ("", "used_count")])
    M = ent(ax, 2, 40, 24, "event_members", [("PK", "id"), ("FK", "event_id → events"), ("FK", "user_id → profiles"),
                                             ("", "role (admin|member|guest)"), ("", "joined_at"), ("UQ", "(event_id, user_id)")])
    G = ent(ax, 28, 40, 24, "guests", [("PK", "id"), ("FK", "event_id → events"), ("", "name"), ("", "phone"),
                                      ("", "family_side"), ("", "rsvp_status (enum)"), ("FK", "added_by → profiles")])
    X = ent(ax, 54, 40, 24, "expenses", [("PK", "id"), ("FK", "event_id → events"), ("FK", "paid_by → profiles"), ("", "amount (numeric)"),
                                        ("", "category (enum)"), ("", "description"), ("", "expense_date")])
    T = ent(ax, 80, 40, 24, "tasks", [("PK", "id"), ("FK", "event_id → events"), ("FK", "assigned_to → profiles"), ("", "title"),
                                     ("", "description"), ("", "deadline"), ("", "status (enum)")])
    A = ent(ax, 106, 40, 23, "activity_log", [("PK", "id"), ("FK", "event_id → events"), ("FK", "actor_id → profiles"), ("", "action"),
                                           ("", "entity_type, entity_id"), ("", "created_at")])
    def rel(p1, p2, t, rad=0):
        ax.add_patch(FancyArrowPatch(p1, p2, arrowstyle="-", lw=1, color=INK, connectionstyle=f"arc3,rad={rad}"))
        ax.text((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 1, t, fontsize=7.5, ha="center",
                bbox=dict(fc="white", ec="none", pad=0.3))
    eb = E[1]
    rel((26, 68), (52, 68), "1 : N  (creates)")
    rel((14, P[1]), (14, 40), "1 : N")
    rel((78, 68), (104, 68), "1 : N")
    for t in (M, G, X, T, A):
        rel((65, eb), (t[0] + t[2] / 2, 40), "")
    ax.text(65, eb - 3, "1 : N  (each child table holds event_id)", ha="center", fontsize=7.5,
            bbox=dict(fc="white", ec="none", pad=0.3))
    ax.text(65, 3, "PK = primary key, FK = foreign key, UQ = unique.  Row Level Security is enabled on every table.",
            ha="center", fontsize=8, style="italic")
    save(fig, "fig4_10_erd")


# ---------------------------------------------------------------- Gantt
def gantt():
    import numpy as np
    tasks = [("Requirement analysis & proposal", 0, 3, 1), ("System design (UML, ERD, schema)", 2, 4, 1),
             ("Setup: Next.js, Supabase, Vercel", 4, 1.5, 1), ("Auth module", 5, 3, 1), ("Event management module", 7, 3, 1),
             ("RBAC & invite links (RLS)", 9, 3, 1), ("40% review & report", 12, 1.5, 1),
             ("Guest list & RSVP", 13.5, 3, 0), ("Expense & budget tracking", 16, 4, 0), ("Tasks & arrangements", 19.5, 3, 0),
             ("Admin dashboard & activity log", 22, 3, 0), ("AI features (Phase 2)", 24.5, 4, 0),
             ("Testing, fixes & final report", 27, 4, 0)]
    fig, ax = plt.subplots(figsize=(10, 4.8), dpi=200)
    for i, (t, s, d, done) in enumerate(tasks):
        ax.barh(i, d, left=s, color=DONE if done else TODO, edgecolor=INK, lw=0.6)
    ax.set_yticks(range(len(tasks))); ax.set_yticklabels([t[0] for t in tasks], fontsize=9)
    ax.invert_yaxis(); ax.set_xlabel("Project week", fontsize=10)
    ax.axvline(13.5, color=MILE, ls="--", lw=1.2); ax.text(13.7, -0.6, "40% milestone", color=MILE, fontsize=9)
    ax.set_xlim(0, 32); ax.grid(axis="x", ls=":", lw=0.6)
    from matplotlib.patches import Patch
    ax.legend(handles=[Patch(fc=DONE, label="Completed"), Patch(fc=TODO, ec=INK, label="Planned")], loc="upper right", fontsize=9)
    for s in ["top", "right"]: ax.spines[s].set_visible(False)
    save(fig, "fig7_1_gantt")


for f in [scrum, usecase, architecture, dfd0, dfd1, classdiag, activity, sequence, state, component, deployment, erd, gantt]:
    f(); print("ok", f.__name__)
