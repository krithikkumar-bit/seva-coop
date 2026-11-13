import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SceneDataCtx = createContext({
  data: {},
  setSceneData: () => {},
  hoveredObject: null,
  setHoveredObject: () => {},
  resetTrigger: 0,
  resetCamera: () => {},
  cameraSector: "default",
  setCameraSector: () => {},
  selectedServiceId: null,
  setSelectedServiceId: () => {},
  hoveredServiceZone: null,
  setHoveredServiceZone: () => {},
  marketplaceSector: "all",
  setMarketplaceSector: () => {},
  splineApp: null,
  setSplineApp: () => {},
});

export function SceneDataProvider({ children }) {
  const [data, setData] = useState({});
  const [hoveredObject, setHoveredObject] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [cameraSector, setCameraSector] = useState("default");
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [hoveredServiceZone, setHoveredServiceZone] = useState(null);
  const [marketplaceSector, setMarketplaceSector] = useState("all");
  const [splineApp, setSplineApp] = useState(null);

  const setSceneData = useCallback((partial) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetCamera = useCallback(() => {
    setResetTrigger((c) => c + 1);
    setCameraSector("default");
    setMarketplaceSector("all");
    setHoveredObject(null);
    setHoveredServiceZone(null);
    setSelectedServiceId(null);
  }, []);

  const value = useMemo(
    () => ({
      data,
      setSceneData,
      hoveredObject,
      setHoveredObject,
      resetTrigger,
      resetCamera,
      cameraSector,
      setCameraSector,
      selectedServiceId,
      setSelectedServiceId,
      hoveredServiceZone,
      setHoveredServiceZone,
      marketplaceSector,
      setMarketplaceSector,
      splineApp,
      setSplineApp,
    }),
    [
      data,
      setSceneData,
      hoveredObject,
      resetTrigger,
      resetCamera,
      cameraSector,
      selectedServiceId,
      hoveredServiceZone,
      marketplaceSector,
      splineApp,
    ],
  );

  return <SceneDataCtx.Provider value={value}>{children}</SceneDataCtx.Provider>;
}

export function useSceneData() {
  return useContext(SceneDataCtx);
}
