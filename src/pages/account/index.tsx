import React, {useEffect, useMemo, useState} from 'react';
import {Box, Page, Spinner, Text} from 'zmp-ui';

import {
  getDisplayPrice,
  getInsightDetail,
  getInsights,
  getRsagent,
  getRsagents,
  getRsitems,
  getRsitemDetail,
} from '@/services/rsitemService';
import type {
  Insight,
  InsightDetail,
  RsAgent,
  RsAgentSummary,
  Rsitem,
} from '@/types/rsitem';

import './style.scss';
import PropertyDetailView from '@/pages/nearby/components/PropertyDetailView';
type AccountView =
  | 'home'
  | 'agents'
  | 'insights'
  | 'agentDetail'
  | 'insightDetail'
  | 'propertyDetail';
  type InsightDisplayMode = 'list' | 'grid';

const DEFAULT_AGENT_AVATAR = 'https://data.nks.vn//storage/users/default.png';
const DEFAULT_POST_IMAGE = 'https://placehold.co/800x500?text=No+Image';

function stripHtml(value?: string | null) {
  if (!value) {
    return '';
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;

  return textarea.value.replace(/<[^>]+>/g, '').trim();
}

function getAgentAvatar(agent?: RsAgentSummary | RsAgent | null) {
  return agent?.avatar || DEFAULT_AGENT_AVATAR;
}

function getAgentName(agent?: RsAgentSummary | RsAgent | null) {
  return agent?.name || 'Môi giới';
}

function getAgentMeta(agent: RsAgentSummary | RsAgent) {
  const parts: string[] = [];

  if ('rslocation' in agent && agent.rslocation) {
    parts.push(agent.rslocation);
  }

  if ('rsexperience' in agent && agent.rsexperience) {
    parts.push(`${agent.rsexperience} năm kinh nghiệm`);
  }

  if ('rsitems' in agent && typeof agent.rsitems === 'number') {
    parts.push(`${agent.rsitems} tin đăng`);
  }

  if ('rsitem_count' in agent && typeof agent.rsitem_count === 'number') {
    parts.push(`${agent.rsitem_count} tin đăng`);
  }

  return parts.length > 0 ? parts.join(' / ') : 'Đang cập nhật';
}
function getAgentsFromRsitems(items: Rsitem[]): RsAgentSummary[] {
  const agentMap = new Map<number, RsAgentSummary>();

  items.forEach(item => {
    const sale = item.sale;

    if (!sale?.id) {
      return;
    }

    const current = agentMap.get(sale.id);

    agentMap.set(sale.id, {
      id: sale.id,
      name: sale.name || current?.name || 'Môi giới',
      avatar: sale.avatar || current?.avatar || null,
      phone: sale.phone || current?.phone || null,
      email: sale.email || current?.email || null,
      rsitems: (current?.rsitems ?? 0) + 1,
    });
  });

  return Array.from(agentMap.values());
}

function mergeAgents(
  apiAgents: RsAgentSummary[],
  itemAgents: RsAgentSummary[],
) {
  const agentMap = new Map<number, RsAgentSummary>();

  apiAgents.forEach(agent => {
    agentMap.set(agent.id, agent);
  });

  itemAgents.forEach(agent => {
    const existed = agentMap.get(agent.id);

    if (!existed) {
      agentMap.set(agent.id, agent);
      return;
    }

    agentMap.set(agent.id, {
      ...agent,
      ...existed,
      rsitems: existed.rsitems ?? agent.rsitems ?? 0,
      avatar: existed.avatar || agent.avatar,
      phone: existed.phone || agent.phone,
      email: existed.email || agent.email,
      name: existed.name || agent.name,
    });
  });

  return Array.from(agentMap.values());
}

function getPostImage(post: Insight) {
  return post.image || DEFAULT_POST_IMAGE;
}

function getPostExcerpt(post: Insight) {
  return post.excerpt || 'Chưa có mô tả ngắn cho bài viết này.';
}

function AgentCircleCard({
  agent,
  onClick,
}: {
  agent: RsAgentSummary;
  onClick: (agent: RsAgentSummary) => void;
}) {
  return (
    <button
      type="button"
      className="account-agent-circle-card"
      onClick={() => onClick(agent)}>
      <img
        className="account-agent-circle-avatar"
        src={getAgentAvatar(agent)}
        alt={getAgentName(agent)}
      />

      <Text className="account-agent-circle-name">
        {getAgentName(agent)}
      </Text>
    </button>
  );
}

function AgentListCard({
  agent,
  onClick,
}: {
  agent: RsAgentSummary;
  onClick: (agent: RsAgentSummary) => void;
}) {
  return (
    <button
      type="button"
      className="account-agent-list-card"
      onClick={() => onClick(agent)}>
      <img
        className="account-agent-list-avatar"
        src={getAgentAvatar(agent)}
        alt={getAgentName(agent)}
      />

      <Box className="account-agent-list-info">
        <Text className="account-agent-list-name">
          {getAgentName(agent)}
        </Text>

        <Text className="account-agent-list-meta">
          {getAgentMeta(agent)}
        </Text>
      </Box>

      <span className="account-card-arrow">›</span>
    </button>
  );
}
function InsightGridCard({
  post,
  onClick,
}: {
  post: Insight;
  onClick: (post: Insight) => void;
}) {
  return (
    <button
      type="button"
      className="account-post-grid-card"
      onClick={() => onClick(post)}>
      <img
        className="account-post-grid-image"
        src={getPostImage(post)}
        alt={post.title || 'Tin tức'}
      />

      <Box className="account-post-grid-content">
        <Text className="account-post-grid-title">
          {post.title || 'Bài viết'}
        </Text>

        <Text className="account-post-grid-date">
          {post.formatedDate || 'Đang cập nhật'}
        </Text>
      </Box>
    </button>
  );
}
function InsightCard({
  post,
  onClick,
}: {
  post: Insight;
  onClick: (post: Insight) => void;
}) {
  return (
    <button
      type="button"
      className="account-post-card"
      onClick={() => onClick(post)}>
      <img
        className="account-post-image"
        src={getPostImage(post)}
        alt={post.title || 'Tin tức'}
      />

      <Box className="account-post-content">
        <Text className="account-post-title">
          {post.title || 'Bài viết'}
        </Text>

        <Text className="account-post-date">
          {post.formatedDate || 'Đang cập nhật'} ·{' '}
          {post.postCategory || 'Tin tức'}
        </Text>

        <Text className="account-post-excerpt">
          {getPostExcerpt(post)}
        </Text>
      </Box>
    </button>
  );
}
function normalizeImageUrl(url?: string | null) {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://data.nks.vn')) {
    return url.replace('http://data.nks.vn', 'https://data.nks.vn');
  }

  return url;
}

function isPlaceholderImage(url?: string | null) {
  return Boolean(
    url?.includes('timzita_rsproject') ||
      url?.includes('placehold.co') ||
      url?.includes('No+Image'),
  );
}

function getAgentPropertyImage(item: Rsitem) {
  const galleryImage = item.gallery?.find(gallery => gallery.image)?.image;

  if (galleryImage) {
    return normalizeImageUrl(galleryImage);
  }

  if (item.featureimg && !isPlaceholderImage(item.featureimg)) {
    return normalizeImageUrl(item.featureimg);
  }

  if (item.featureimg) {
    return normalizeImageUrl(item.featureimg);
  }

  return DEFAULT_POST_IMAGE;
}
function AgentPropertyCard({
  item,
  onClick,
}: {
  item: Rsitem;
  onClick: (item: Rsitem) => void;
}) {
  return (
    <button
      type="button"
      className="account-agent-property-card"
      onClick={() => onClick(item)}>
      <img
        className="account-agent-property-image"
        src={getAgentPropertyImage(item)}
        alt={item.title || 'Tin bất động sản'}
      />

      <Box className="account-agent-property-content">
        <Text className="account-agent-property-title">
          {item.title || 'Tin bất động sản'}
        </Text>

        <Text className="account-agent-property-price">
          {getDisplayPrice(item)}
        </Text>

        <Text className="account-agent-property-meta">
          {item.total_area ? `${item.total_area} m²` : 'Đang cập nhật diện tích'}
        </Text>
      </Box>
    </button>
  );
}

export default function AccountPage() {
  const [view, setView] = useState<AccountView>('home');

  const [agents, setAgents] = useState<RsAgentSummary[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [allRsitems, setAllRsitems] = useState<Rsitem[]>([]);

  const [selectedAgent, setSelectedAgent] = useState<RsAgentSummary | null>(
    null,
  );
  const [agentDetail, setAgentDetail] = useState<RsAgent | null>(null);

  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Rsitem | null>(null);
const [propertyDetail, setPropertyDetail] = useState<Rsitem | null>(null);
const [previousView, setPreviousView] = useState<AccountView>('home');
  const [insightDetail, setInsightDetail] = useState<InsightDetail | null>(
    null,
  );

  const [agentKeyword, setAgentKeyword] = useState('');
  const [insightDisplayMode, setInsightDisplayMode] =
  useState<InsightDisplayMode>('list');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
  try {
    setLoading(true);
    setErrorMessage('');

    const [agentData, insightData, rsitemData] = await Promise.all([
      getRsagents(),
      getInsights(),
      getRsitems(),
    ]);

    const itemAgents = getAgentsFromRsitems(rsitemData);
    const mergedAgents = mergeAgents(agentData, itemAgents);
setAllRsitems(rsitemData);
    setAgents(mergedAgents);
    setInsights(insightData);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể tải dữ liệu tài khoản.';

    setErrorMessage(message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadData();
  }, []);

  const homeAgents = useMemo(() => {
    return agents.slice(0, 4);
  }, [agents]);

  const homeInsights = useMemo(() => {
    return insights.slice(0, 3);
  }, [insights]);

  const filteredAgents = useMemo(() => {
    const keyword = agentKeyword.trim().toLowerCase();

    if (!keyword) {
      return agents;
    }

    return agents.filter(agent => {
      const text = [
        agent.name,
        agent.email,
        agent.phone,
        String(agent.rsitems ?? ''),
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [agents, agentKeyword]);
  const selectedAgentPosts = useMemo(() => {
  const agentId = agentDetail?.id ?? selectedAgent?.id;

  if (!agentId) {
    return [];
  }

  const postsFromAllItems = allRsitems.filter(item => {
    return Number(item.sale?.id) === Number(agentId);
  });

  const postsFromDetail = agentDetail?.rsitems ?? [];

  const postMap = new Map<number, Rsitem>();

  postsFromAllItems.forEach(item => {
    postMap.set(item.id, item);
  });

  postsFromDetail.forEach(item => {
    const existed = postMap.get(item.id);

    postMap.set(item.id, {
      ...item,
      ...existed,
      gallery: existed?.gallery ?? item.gallery,
      featureimg: existed?.featureimg || item.featureimg,
    });
  });

  return Array.from(postMap.values());
}, [agentDetail, selectedAgent, allRsitems]);

  const openAgent = async (agent: RsAgentSummary) => {
    try {
      setSelectedAgent(agent);
      setAgentDetail(null);
      setDetailLoading(true);
      setView('agentDetail');

      const detail = await getRsagent(agent.id);

      setAgentDetail(detail);
    } catch (error) {
      console.log('Load agent detail failed:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const openInsight = async (post: Insight) => {
    if (!post.slug) {
      return;
    }

    try {
      setSelectedInsight(post);
      setInsightDetail(null);
      setDetailLoading(true);
      setView('insightDetail');

      const detail = await getInsightDetail(post.slug);

      setInsightDetail(detail);
    } catch (error) {
      console.log('Load insight detail failed:', error);
    } finally {
      setDetailLoading(false);
    }
  };
  const openPropertyDetail = async (item: Rsitem) => {
  if (!item.slug) {
    setSelectedProperty(item);
    setPropertyDetail(item);
    setPreviousView(view);
    setView('propertyDetail');
    return;
  }

  try {
    setSelectedProperty(item);
    setPropertyDetail(null);
    setPreviousView(view);
    setDetailLoading(true);
    setView('propertyDetail');

    const detail = await getRsitemDetail(item.slug);

    setPropertyDetail(detail);
  } catch (error) {
    console.log('Load property detail failed:', error);
    setPropertyDetail(item);
  } finally {
    setDetailLoading(false);
  }
};

  const goHome = () => {
    setView('home');
    setSelectedAgent(null);
    setAgentDetail(null);
    setSelectedInsight(null);
    setInsightDetail(null);
  };

  const goBack = () => {
    if (view === 'home') {
      return;
    }

    goHome();
  };

  return (
    
    <Page className="account-page">
      {view === 'home' ? (
        <>
          <Box className="account-header">
            <Text className="account-title">Tài khoản</Text>
            <Text className="account-subtitle">
              Cộng đồng môi giới và tin tức hoạt động
            </Text>
          </Box>

          {loading ? (
            <Box className="account-loading">
              <Spinner />
              <Text className="account-loading-text">Đang tải dữ liệu...</Text>
            </Box>
          ) : null}

          {errorMessage ? (
            <Box className="account-error-box">
              <Text className="account-error-text">{errorMessage}</Text>
            </Box>
          ) : null}

          {!loading && !errorMessage ? (
            <Box className="account-content">
              <Box className="account-section">
                <Box className="account-section-header">
                  <Text className="account-section-title">
                    Cộng đồng môi giới
                  </Text>

                  <button
                    type="button"
                    className="account-view-all-button"
                    onClick={() => setView('agents')}>
                    view all
                  </button>
                </Box>

                <Box className="account-agent-horizontal">
                  {homeAgents.map(agent => (
                    <AgentCircleCard
                      key={agent.id}
                      agent={agent}
                      onClick={openAgent}
                    />
                  ))}
                </Box>
              </Box>

              <Box className="account-section">
                <Box className="account-section-header">
                  <Text className="account-section-title">
                    Tin tức hoạt động
                  </Text>

                  <button
                    type="button"
                    className="account-view-all-button"
                    onClick={() => setView('insights')}>
                    view all
                  </button>
                </Box>

                <Box className="account-post-list">
                  {homeInsights.map(post => (
                    <InsightCard
                      key={post.slug}
                      post={post}
                      onClick={openInsight}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          ) : null}
        </>
      ) : null}

      {view === 'agents' ? (
        <Box className="account-sub-page">
          <Box className="account-topbar">
            <button type="button" className="account-back" onClick={goBack}>
              ←
            </button>

            <Text className="account-topbar-title">Cộng đồng môi giới</Text>
          </Box>

          <Box className="account-search-box">
            <input
              className="account-search-input"
              value={agentKeyword}
              placeholder="Search"
              onChange={event => setAgentKeyword(event.target.value)}
            />
          </Box>

          <Box className="account-agent-list">
            {filteredAgents.map(agent => (
              <AgentListCard
                key={agent.id}
                agent={agent}
                onClick={openAgent}
              />
            ))}
          </Box>
        </Box>
      ) : null}

     {view === 'insights' ? (
  <Box className="account-sub-page">
    <Box className="account-topbar">
      <button type="button" className="account-back" onClick={goBack}>
        ←
      </button>

      <Text className="account-topbar-title">Tin tức hoạt động</Text>
    </Box>

    <Box className="account-view-mode-row">
      <button
        type="button"
        className={`account-view-mode-button ${
          insightDisplayMode === 'list' ? 'active' : ''
        }`}
        onClick={() => setInsightDisplayMode('list')}>
        ☰ Danh sách
      </button>

      <button
        type="button"
        className={`account-view-mode-button ${
          insightDisplayMode === 'grid' ? 'active' : ''
        }`}
        onClick={() => setInsightDisplayMode('grid')}>
        ▦ Lưới
      </button>
    </Box>

    {insightDisplayMode === 'list' ? (
      <Box className="account-post-list account-post-list-full">
        {insights.map(post => (
          <InsightCard
            key={post.slug}
            post={post}
            onClick={openInsight}
          />
        ))}
      </Box>
    ) : (
      <Box className="account-post-grid">
        {insights.map(post => (
          <InsightGridCard
            key={post.slug}
            post={post}
            onClick={openInsight}
          />
        ))}
      </Box>
    )}
  </Box>
) : null}

      {view === 'agentDetail' ? (
        <Box className="account-sub-page">
          <Box className="account-topbar">
            <button type="button" className="account-back" onClick={goBack}>
              ←
            </button>

            <Text className="account-topbar-title">Thông tin môi giới</Text>
          </Box>

          {detailLoading ? (
            <Box className="account-loading">
              <Spinner />
              <Text className="account-loading-text">
                Đang tải thông tin môi giới...
              </Text>
            </Box>
          ) : null}

          {!detailLoading ? (
            <Box className="account-agent-detail">
              <img
                className="account-agent-detail-avatar"
                src={getAgentAvatar(agentDetail || selectedAgent)}
                alt={getAgentName(agentDetail || selectedAgent)}
              />

              <Text className="account-agent-detail-name">
                {getAgentName(agentDetail || selectedAgent)}
              </Text>

              <Text className="account-agent-detail-slogan">
                {agentDetail?.rslogan || 'Môi giới chuyên nghiệp'}
              </Text>

              <Box className="account-agent-detail-stats">
                <Box className="account-agent-detail-stat">
                  <Text className="account-agent-detail-label">
                    Kinh nghiệm
                  </Text>
                  <Text className="account-agent-detail-value">
                    {agentDetail?.rsexperience
                      ? `${agentDetail.rsexperience} năm`
                      : 'Đang cập nhật'}
                  </Text>
                </Box>

                <Box className="account-agent-detail-stat">
                  <Text className="account-agent-detail-label">
                    Tin đăng
                  </Text>
                  <Text className="account-agent-detail-value">
                    {agentDetail?.rsitem_count ?? selectedAgent?.rsitems ?? 0}
                  </Text>
                </Box>

                <Box className="account-agent-detail-stat">
                  <Text className="account-agent-detail-label">
                    Khu vực
                  </Text>
                  <Text className="account-agent-detail-value">
                    {agentDetail?.rslocation || 'Đang cập nhật'}
                  </Text>
                </Box>
              </Box>

              <Box className="account-agent-bio-box">
                <Text className="account-agent-bio">
                  {agentDetail?.rsbio || 'Chưa có thông tin giới thiệu.'}
                </Text>
              </Box>

              <Text className="account-detail-section-title">
                Tin đăng của môi giới
              </Text>

              <Box className="account-agent-property-list">
  {selectedAgentPosts.length > 0 ? (
    selectedAgentPosts.map(item => (
      <AgentPropertyCard
  key={item.id}
  item={item}
  onClick={openPropertyDetail}
/>
    ))
  ) : (
    <Box className="account-agent-bio-box">
      <Text className="account-agent-bio">
        Chưa có tin đăng nào cho môi giới này.
      </Text>
    </Box>
  )}
</Box>
            </Box>
          ) : null}
        </Box>
      ) : null}

      {view === 'insightDetail' ? (
        <Box className="account-sub-page">
          <Box className="account-topbar">
            <button type="button" className="account-back" onClick={goBack}>
              ←
            </button>

            <Text className="account-topbar-title">Thông tin bài viết</Text>
          </Box>

          {detailLoading ? (
            <Box className="account-loading">
              <Spinner />
              <Text className="account-loading-text">
                Đang tải bài viết...
              </Text>
            </Box>
          ) : null}

          {!detailLoading ? (
            <Box className="account-insight-detail">
              <img
                className="account-insight-detail-image"
                src={getPostImage(insightDetail || selectedInsight || {})}
                alt={(insightDetail || selectedInsight)?.title || 'Bài viết'}
              />

              <Text className="account-insight-detail-title">
                {(insightDetail || selectedInsight)?.title || 'Bài viết'}
              </Text>

              <Text className="account-insight-detail-meta">
                {(insightDetail || selectedInsight)?.formatedDate ||
                  'Đang cập nhật'}{' '}
                ·{' '}
                {(insightDetail || selectedInsight)?.postCategory ||
                  'Tin tức'}
              </Text>

              {insightDetail?.body ? (
                <div
                  className="account-insight-body"
                  dangerouslySetInnerHTML={{
                    __html: insightDetail.body,
                  }}
                />
              ) : (
                <Text className="account-insight-empty">
                  {stripHtml(selectedInsight?.excerpt) ||
                    'Chưa có nội dung bài viết.'}
                </Text>
              )}
            </Box>
          ) : null}
        </Box>
      ) : null}
      {view === 'propertyDetail' ? (
  propertyDetail || selectedProperty ? (
    <PropertyDetailView
      item={propertyDetail || selectedProperty!}
      loading={detailLoading}
      onBack={() => {
        setView(previousView);
        setSelectedProperty(null);
        setPropertyDetail(null);
      }}
      onViewMap={() => {
        alert('Bạn vui lòng xem bản đồ ở tab Tìm kiếm.');
      }}
      onOpenSale={() => {
        if (selectedAgent) {
          setView('agentDetail');
          return;
        }

        setView('home');
      }}
    />
  ) : null
) : null}
    </Page>
  );
}