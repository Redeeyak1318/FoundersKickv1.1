export const MOCK_USERS = {
    currentUser: { id: 'u_1', name: 'Sarah Jin', avatar: 'https://i.pravatar.cc/150?img=47', role: 'Founder & CEO', company: 'NovaStack', bio: 'Building the next generation of developer tools. Previously scaling infrastructure at Stripe. Obsessed with dx and fast workflows.', location: 'San Francisco, CA' },
    alex: { id: 'u_2', name: 'Alex Reeves', avatar: 'https://i.pravatar.cc/150?img=11', role: 'Co-Founder', company: 'CloudFlow', location: 'London, UK' },
    liam: { id: 'u_3', name: "Liam O'Donnell", avatar: 'https://i.pravatar.cc/150?img=33', role: 'CPO', company: 'Lumina', location: 'New York, NY' },
    mark: { id: 'u_4', name: 'Mark Johansson', avatar: 'https://i.pravatar.cc/150?img=8', role: 'Partner', company: 'Alpha Ventures', location: 'Berlin, DE' },
    lisa: { id: 'u_5', name: 'Lisa K.', avatar: 'https://i.pravatar.cc/150?img=5', role: 'CTO', company: 'SyncWave', location: 'Austin, TX' },
    elena: { id: 'u_7', name: 'Elena Vance', avatar: 'https://i.pravatar.cc/150?img=9', role: 'Founder', company: 'BioGrid', location: 'Boston, MA' },
    daniel: { id: 'u_8', name: 'Daniel Kim', avatar: 'https://i.pravatar.cc/150?img=12', role: 'Product Lead', company: 'SyncWave', location: 'Seoul, KR' },
};

export const MOCK_POSTS = [
    {
        id: 'p_1',
        author: MOCK_USERS.alex,
        timestamp: '2h ago',
        content: 'Just crossed $45k MRR after 14 months of grinding. The key was moving from a flat subscription to usage-based pricing. The feedback loop is now 3x faster. Still so much to learn, but the momentum is real.',
        image: null,
        likes: 124,
        comments: 18,
        shares: 4,
        metrics: { label: 'Growth Velocity', value: '+12.4%', sub: 'W-o-W', icon: 'trending-up' },
        isCompanyPost: false
    },
    {
        id: 'p_2',
        author: MOCK_USERS.liam,
        timestamp: '5h ago',
        content: '"The best startups aren\'t built on secret ideas, they are built on public accountability." \n\nOpening our internal dashboard to early investors today. Nervous but the transparency is going to drive us faster.',
        image: null,
        likes: 89,
        comments: 12,
        shares: 1,
        isCompanyPost: false
    },
    {
        id: 'p_3',
        author: MOCK_USERS.elena,
        timestamp: '1d ago',
        content: 'We just closed a $3.2M Seed round to scale BioGrid! Grateful to @Mark Johansson and Alpha Ventures for believing in our vision for computational biology. Time to get back to building. 🧬🚀',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        likes: 342,
        comments: 45,
        shares: 12,
        isCompanyPost: false
    }
];

export const MOCK_TRENDING_TOPICS = [
    { id: 1, tag: '#SaaS', title: 'The rise of vertically integrated AI workflow tools.', count: '2.4k' },
    { id: 2, tag: '#Funding', title: 'Bridge rounds vs. Flat rounds in Q3 2024.', count: '1.1k' },
    { id: 3, tag: '#Bootstrapping', title: 'Reaching $10k MRR without outside capital.', count: '890' }
];

export const MOCK_SUGGESTED_CONNECTIONS = [
    { id: 's1', user: MOCK_USERS.elena, industry: 'Web3 Infrastructure' },
    { id: 's2', user: MOCK_USERS.liam, industry: 'FinTech / Seed' },
    { id: 's3', user: MOCK_USERS.daniel, industry: 'Enterprise SaaS' },
];

export const MOCK_SYSTEM_STATUS = {
    networkValue: '$12.4M',
    progress: 66,
    rank: 'Top 5%'
};

export const MOCK_STARTUPS = [
    {
        id: 'st1',
        name: 'Lumina AI',
        logo: 'https://i.pravatar.cc/150?img=41',
        tagline: 'AI-powered data management for enterprise.',
        stage: 'Series A',
        tags: ['#Enterprise', '#AI', '#B2B'],
        metrics: [
            { label: 'MRR', value: '$125K' },
            { label: 'Team', value: '35' },
            { label: 'Growth', value: '+14% MoM' }
        ],
        bookmark: false
    },
    {
        id: 'st2',
        name: 'CloudFlow',
        logo: 'https://i.pravatar.cc/150?img=22',
        tagline: 'Streamlining CI/CD pipelines autonomously.',
        stage: 'Seed',
        tags: ['#DevTools', '#Infrastructure'],
        metrics: [
            { label: 'MRR', value: '$45K' },
            { label: 'Team', value: '8' },
            { label: 'Growth', value: '+22% MoM' }
        ],
        bookmark: true
    },
    {
        id: 'st3',
        name: 'BioGrid',
        logo: 'https://i.pravatar.cc/150?img=15',
        tagline: 'Next-gen computational biology platform.',
        stage: 'Series A',
        tags: ['#HealthTech', '#Biotech'],
        metrics: [
            { label: 'Funding', value: '$4.5M' },
            { label: 'Team', value: '24' },
            { label: 'Customers', value: '12 Orgs' }
        ],
        bookmark: false
    }
];

export const MOCK_CONVERSATIONS = [
    {
        id: 'conv_1',
        user: MOCK_USERS.alex,
        lastMessage: 'Let me send over the updated deck.',
        timestamp: '3m ago',
        unread: false,
        active: true,
        messages: [
            { id: 'm1', sender: MOCK_USERS.alex, text: 'Hey Sarah, been following your updates on NovaStack. Really impressive growth lately.', time: '10:15 AM' },
            { id: 'm2', sender: MOCK_USERS.currentUser, text: 'Thanks Alex! It\'s been a sprint but we\'re finally finding true product-market fit. How are things at CloudFlow?', time: '10:16 AM' },
            { id: 'm3', sender: MOCK_USERS.alex, text: 'Getting there. We crossed $45k MRR this week. Looking to raise a bridge round soon to scale the GTM team.', time: '10:17 AM' },
            { id: 'm4', sender: MOCK_USERS.currentUser, text: 'That\'s huge, congrats! Let me know if you want intros to any of the seed funds I know.', time: '10:18 AM' },
            { id: 'm5', sender: MOCK_USERS.alex, text: 'That would be amazing. Let me send over the updated deck.', time: '10:19 AM' },
            { id: 'm6', sender: MOCK_USERS.alex, type: 'attachment', text: 'CloudFlow_Bridge_Deck.pdf', size: '2.4 MB', time: '10:20 AM' }
        ]
    },
    {
        id: 'conv_2',
        user: MOCK_USERS.lisa,
        lastMessage: 'Are you going to the tech meetup?',
        timestamp: '1h ago',
        unread: true,
        active: false,
        messages: []
    },
    {
        id: 'conv_3',
        user: MOCK_USERS.mark,
        lastMessage: 'Good point on the valuation caps.',
        timestamp: 'yesterday',
        unread: false,
        active: false,
        messages: []
    }
];

export const MOCK_NOTIFICATIONS = [
    { id: 'n1', user: MOCK_USERS.alex, action: 'liked your post', target: '"Just shipped the new analytics dashboard..."', time: '10m ago', icon: 'heart', unread: true },
    { id: 'n2', user: MOCK_USERS.mark, action: 'started following you', time: '2h ago', icon: 'user-plus', unread: true },
    { id: 'n3', user: MOCK_USERS.liam, action: 'mentioned you in a comment', target: '"@Sarah Jin this is exactly the approach we took at Lumina."', time: '5h ago', icon: 'message-square', unread: false }
];
